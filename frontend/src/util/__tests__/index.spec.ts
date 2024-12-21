import { expect, test } from 'vitest'

import * as util from './../index'

test('Ensure proper gross income data calculation', () => {
  let dummyData = {
    id: 133,
    TCMMVBCV: 26.928,
    alicuotaMinTaxMMVBCV: 14.9999,
    wasteCollectionTaxMMVBCV: 1.2013,

    expectedMinTaxInBs: 403.92,
    expectedWasteCollectionTaxInBs: 32.35
  }

  let minTaxInBs = util.getMinTaxInBs(
    null, 
    dummyData.TCMMVBCV, 
    dummyData.alicuotaMinTaxMMVBCV
  )

  let wasteCollectionTaxInBs = util.getWasteCollectionTaxInBs(
    null, 
    dummyData.TCMMVBCV, 
    dummyData.wasteCollectionTaxMMVBCV
  )

  expect(minTaxInBs).toBe(dummyData.expectedMinTaxInBs)
  expect(wasteCollectionTaxInBs).toBe(dummyData.expectedWasteCollectionTaxInBs)


  // second test
  dummyData = {
    id: 21,
    TCMMVBCV: 39.83,
    alicuotaMinTaxMMVBCV: 15.0,
    wasteCollectionTaxMMVBCV: 5.0,

    expectedMinTaxInBs: 597.45,
    expectedWasteCollectionTaxInBs: 199.15
  }

  expect(
    util.getMinTaxInBs(
      null, 
      dummyData.TCMMVBCV, 
      dummyData.alicuotaMinTaxMMVBCV
    )
  ).toBe(dummyData.expectedMinTaxInBs)

  expect(
    util.getWasteCollectionTaxInBs(
      null, 
      dummyData.TCMMVBCV, 
      dummyData.wasteCollectionTaxMMVBCV
    )
  ).toBe(dummyData.expectedWasteCollectionTaxInBs)


  // third test
  dummyData = {
    id: 109,
    TCMMVBCV: 38.74,
    alicuotaMinTaxMMVBCV: 15.004,
    wasteCollectionTaxMMVBCV: 10.1961,
    
    expectedMinTaxInBs: 581.25,// in the data base is 581.26, witch is an error, but anyways 
    expectedWasteCollectionTaxInBs: 395.0,

    // expectedTotalInBs: 976.25,
    // alicuotaTaxPercent: 0.1,
  }

  expect(
    util.getMinTaxInBs(
      null, 
      dummyData.TCMMVBCV, 
      dummyData.alicuotaMinTaxMMVBCV
    )
  ).toBe(dummyData.expectedMinTaxInBs)

  expect(
    util.getWasteCollectionTaxInBs(
      null, 
      dummyData.TCMMVBCV, 
      dummyData.wasteCollectionTaxMMVBCV
    )
  ).toBe(dummyData.expectedWasteCollectionTaxInBs)
});
