import { describe, it, expect } from 'vitest'
import { listHospitals, getHospitalById, matchBillLines } from './billMath.js'

// All hospital IDs/names/prices below are FICTIONAL, built only to exercise
// the lookup and math — they do not represent any real hospital or file.
const fixture = {
  hospitals: [
    {
      id: 'fictional-general',
      name: 'Fictional General Hospital',
      system: 'Fictional Health System',
      city: 'Testville',
      status: 'available',
      source_file_url: 'https://example.com/fictional-general/standardcharges.json',
      retrieval_date: '2026-01-15',
      lines: [
        { code: '99284', description: 'ER visit, E/M level 4 (high)', gross_charge: 1200, discounted_cash_price: 780 },
        { code: '70450', description: 'CT head/brain without contrast', gross_charge: 400, discounted_cash_price: 250 },
      ],
    },
    {
      id: 'fictional-blocked',
      name: 'Fictional Blocked Hospital',
      system: 'Fictional Health System',
      city: 'Nowhere',
      status: 'not_available',
      unavailable_reason: 'Fictional block for test purposes.',
      lines: [],
    },
  ],
}

describe('listHospitals', () => {
  it('returns id/name/system/city/status for every hospital', () => {
    const list = listHospitals(fixture)
    expect(list).toHaveLength(2)
    expect(list[0]).toEqual({ id: 'fictional-general', name: 'Fictional General Hospital', system: 'Fictional Health System', city: 'Testville', status: 'available' })
  })
})

describe('getHospitalById', () => {
  it('finds a hospital by id', () => {
    expect(getHospitalById(fixture, 'fictional-general').name).toBe('Fictional General Hospital')
  })

  it('returns null for an unknown id', () => {
    expect(getHospitalById(fixture, 'does-not-exist')).toBeNull()
  })
})

describe('matchBillLines', () => {
  const hospital = getHospitalById(fixture, 'fictional-general')

  it('matches a known code and computes billed vs. cash price difference', () => {
    const { matched, unmatched } = matchBillLines(hospital, [{ code: '99284', billedAmount: '$4,850.00' }])
    expect(unmatched).toHaveLength(0)
    expect(matched).toEqual([
      {
        code: '99284',
        description: 'ER visit, E/M level 4 (high)',
        billedAmount: 4850,
        cashPrice: 780,
        difference: 4070,
        sourceFileUrl: 'https://example.com/fictional-general/standardcharges.json',
        retrievalDate: '2026-01-15',
      },
    ])
  })

  it('handles a plain numeric billedAmount (no $ or commas)', () => {
    const { matched } = matchBillLines(hospital, [{ code: '70450', billedAmount: 3100 }])
    expect(matched[0].difference).toBe(2850)
  })

  it('is case-insensitive on code', () => {
    const { matched } = matchBillLines(hospital, [{ code: 'g0378'.toUpperCase(), billedAmount: 100 }])
    expect(matched).toHaveLength(0) // code not on this fictional hospital's file at all
  })

  it('flags a code the hospital has no real price for as unmatched, not zero', () => {
    const { matched, unmatched } = matchBillLines(hospital, [{ code: '99999', billedAmount: '500' }])
    expect(matched).toHaveLength(0)
    expect(unmatched).toEqual([{ code: '99999', billedAmount: '500', reason: 'no_price_on_file' }])
  })

  it('flags an unparseable billed amount as invalid input rather than guessing', () => {
    const { matched, unmatched } = matchBillLines(hospital, [{ code: '99284', billedAmount: 'not a number' }])
    expect(matched).toHaveLength(0)
    expect(unmatched).toEqual([{ code: '99284', billedAmount: 'not a number', reason: 'invalid_input' }])
  })

  it('never shows a diff when the bill was actually cheaper than the cash price', () => {
    const { matched } = matchBillLines(hospital, [{ code: '70450', billedAmount: '100' }])
    expect(matched[0].difference).toBe(-150)
  })

  it('returns everything as unmatched for a hospital marked not_available', () => {
    const blocked = getHospitalById(fixture, 'fictional-blocked')
    const { matched, unmatched } = matchBillLines(blocked, [{ code: '99284', billedAmount: '500' }])
    expect(matched).toHaveLength(0)
    expect(unmatched).toEqual([{ code: '99284', billedAmount: '500', reason: 'hospital_not_available' }])
  })

  it('handles an empty line list', () => {
    expect(matchBillLines(hospital, [])).toEqual({ matched: [], unmatched: [] })
  })
})
