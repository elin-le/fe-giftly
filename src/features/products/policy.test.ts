import { calcAdvanceAmount, mergePolicies } from './policy'
import type { VariantPolicy } from './types'

const policy = (p: Partial<VariantPolicy>): VariantPolicy => ({
  isPerishable: false, shelfLifeHours: null, returnPolicy: 'RETURNABLE', advancePaymentPercent: null, ...p,
})

describe('mergePolicies', () => {
  it('mặc định cho phép đổi trả và không đặt cọc', () => {
    expect(mergePolicies([])).toEqual({ returnPolicy: 'RETURNABLE', advancePaymentPercent: 0, isPerishable: false, shelfLifeHours: null })
    expect(mergePolicies([null, undefined, policy({})]).returnPolicy).toBe('RETURNABLE')
  })

  it('một thành phần NO_RETURN khiến cả dòng NO_RETURN', () => {
    expect(mergePolicies([policy({}), policy({ returnPolicy: 'NO_RETURN' })]).returnPolicy).toBe('NO_RETURN')
  })

  it('lấy tỷ lệ đặt cọc cao nhất', () => {
    expect(mergePolicies([policy({ advancePaymentPercent: 50 }), policy({ advancePaymentPercent: 70 }), policy({})]).advancePaymentPercent).toBe(70)
  })

  it('lấy hạn dùng ngắn nhất của thành phần dễ hỏng', () => {
    const merged = mergePolicies([policy({ isPerishable: true, shelfLifeHours: 72 }), policy({ isPerishable: true, shelfLifeHours: 24 }), policy({ shelfLifeHours: 5 })])
    expect(merged).toMatchObject({ isPerishable: true, shelfLifeHours: 24 })
  })
})

describe('calcAdvanceAmount', () => {
  it('1.000.000đ với cọc 50% là 500.000đ', () => expect(calcAdvanceAmount(1_000_000, 50)).toBe(500_000))
  it('0% hoặc không cọc là 0', () => expect(calcAdvanceAmount(1_000_000, 0)).toBe(0))
  it('làm tròn đến đồng', () => expect(calcAdvanceAmount(100_001, 50)).toBe(50_001))
})
