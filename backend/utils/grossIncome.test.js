const util = require('./../utils/grossIncome')



describe('grossIncomeUtil Lib', () => {

  let expect;

  before(async () => {
      // Dynamically import chai
      ({ expect } = await import('chai'));
  });

  it('should calculate tax fields, case #1', () => {

    let dummyData = {
      id: 133,
      chargeWasteCollection: true,
      TCMMVBCV: 26.928,
      alicuotaMinTaxMMVBCV: 14.9999,
      wasteCollectionTaxMMVBCV: 1.2013,

      amountBs: 122.76,

      alicuotaTaxPercent: 0.025,
      
  
      expectedMinTaxInBs: 403.92,
      expectedWasteCollectionTaxInBs: 32.35,

      expectedTaxInBs: 3.07,
      expectedTotalTaxInBs: 436.27
    }
  
    let grossIncomeResult = util.calculateTaxFields({grossIncome: dummyData})
  
    let minTaxInBs = grossIncomeResult.minTaxInBs
    let wasteCollectionTaxInBs = grossIncomeResult.wasteCollectionTaxInBs
  
    expect(minTaxInBs).to.equal(dummyData.expectedMinTaxInBs)
    expect(wasteCollectionTaxInBs).to.equal(dummyData.expectedWasteCollectionTaxInBs)
    expect(grossIncomeResult.taxInBs).to.equal(dummyData.expectedTaxInBs)
    expect(grossIncomeResult.totalTaxInBs).to.equal(dummyData.expectedTotalTaxInBs)


  })

  it('should calculate tax fields, case #2', () => {

    let dummyData = {
      id: 21,
      chargeWasteCollection: true,
      
      TCMMVBCV: 39.83,
      alicuotaMinTaxMMVBCV: 15.0,
      wasteCollectionTaxMMVBCV: 5.0,
  
      amountBs: 13860.28,
      alicuotaTaxPercent: 0.025,
      
      expectedMinTaxInBs: 597.45, // in the data base is 581.26, witch is an error, but anyways 
      expectedWasteCollectionTaxInBs: 199.15,
  
      expectedTaxInBs: 346.51,
      expectedTotalTaxInBs: 796.6
    }
  
    let grossIncomeResult = util.calculateTaxFields({grossIncome: dummyData})
  
    expect(grossIncomeResult.minTaxInBs).to.equal(dummyData.expectedMinTaxInBs)
    expect(grossIncomeResult.wasteCollectionTaxInBs).to.equal(dummyData.expectedWasteCollectionTaxInBs)
    expect(grossIncomeResult.taxInBs).to.equal(dummyData.expectedTaxInBs)
    expect(grossIncomeResult.totalTaxInBs).to.equal(dummyData.expectedTotalTaxInBs)

  })

  it('should calculate tax fields, case #3', () => {

    let dummyData = {
      id: 109,
      chargeWasteCollection: true,
      
      TCMMVBCV: 38.74,
      alicuotaMinTaxMMVBCV: 15.004,
      wasteCollectionTaxMMVBCV: 10.1961,
  
      amountBs: 18058.56,
      alicuotaTaxPercent: 0.01,
      
      expectedMinTaxInBs: 581.25, // in the data base is 581.26, witch is an error, but anyways 
      expectedWasteCollectionTaxInBs: 395.0,
  
      expectedTaxInBs: 180.59,
      expectedTotalTaxInBs: 976.25
    }
  
    let grossIncomeResult = util.calculateTaxFields({grossIncome: dummyData})
  
    expect(grossIncomeResult.minTaxInBs).to.equal(dummyData.expectedMinTaxInBs)
    expect(grossIncomeResult.wasteCollectionTaxInBs).to.equal(dummyData.expectedWasteCollectionTaxInBs)
    expect(grossIncomeResult.taxInBs).to.equal(dummyData.expectedTaxInBs)
    expect(grossIncomeResult.totalTaxInBs).to.equal(dummyData.expectedTotalTaxInBs)

  })
})