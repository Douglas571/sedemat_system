import dayjs from 'dayjs'

import { IPenalty } from '../util/types'

export async function getAllPenaltyTypes() {
  return [
      {
          id: 0,
          name: 'Baja',
          defaultAmountMMVBCV: 20,
      },
      {
          id: 1,
          name: 'Media',
          defaultAmountMMVBCV: 40,
      },
      {
          id: 2,
          name: 'Alta',
          defaultAmountMMVBCV: 60,
      }
  ]
}

export async function getAllPenalties({
  token
}: {
  token: string
}) {
  return [
    {
        id: '1',
        type: {
            id: 1,
            name: 'Baja'
        },
        amountMMVBCV: 20,
        description: 'La contribuyente adeuda 6 meses de impuesto de renta',
        createdAt: dayjs().format(),
        updatedAt: dayjs().format()
    },
    {
        id: '2',
        type: {
            id: 2,
            name: 'Media'
        },
        amountMMVBCV: 40,
        description: ' dummy penalty 2',
        createdAt: dayjs().add(1, 'day').format(),
        updatedAt: dayjs().add(1, 'day').format()
    },
    {
        id: '3',
        type: {
            id: 3,
            name: 'Alta'
        },
        amountMMVBCV: 60,
        description: ' dummy penalty 3',
        createdAt: dayjs().add(2, 'day').format(),
        updatedAt: dayjs().add(2, 'day').format()
    },
  ]
}


export async function createPenalty({
  penalty,
  token
}: {
  penalty: IPenalty,
  token: string
}) {
  console.log({newPenalty: penalty})
}

export async function updatePenalty({
  id,
  penalty,
  token
}: {
  id: number,
  penalty: IPenalty,
  token: string
}) {
  console.log({id, updatedPenalty: penalty})
}

export async function deletePenalty({
  id,
  token
}: {
  id: number,
  token: string
}) {
  console.log({deletedPenalty: id})
}