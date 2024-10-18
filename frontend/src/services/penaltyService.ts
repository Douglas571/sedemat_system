import dayjs from 'dayjs'

import { IPenalty } from '../util/types'

const IP = process.env.BACKEND_IP || "localhost"
const PORT = "3000"
const HOST = "http://" + IP + ":" + PORT

const ENDPOINT = "/v1/penalties"

export async function getAllPenaltyTypes() {

  const response = await fetch(`${HOST}${ENDPOINT}/types`)
  const data = await response.json()

  return data
}

export async function getAllPenalties({
  token
}: {
  token: string
}) {


  const response = await fetch(`${HOST}${ENDPOINT}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await response.json()

  if (!response.ok) {
    if (data.error && data.error.name === "UserNotAuthorized") {
      throw new Error("Solo el recaudador puede obtener las multas");
    }

    throw new Error(data.message);
  }
  
  return data
}

export async function createPenalty({
  penalty,
  token
}: {
  penalty: IPenalty,
  token: string
}) {


  console.log({newPenalty: penalty})
  const response = await fetch(`${HOST}${ENDPOINT}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(penalty)
  });

  const data = await response.json();

  if (!response.ok) {
    if (data.error && data.error.name === "UserNotAuthorized") {
      throw new Error("Solo el recaudador puede crear multas");
    }

    throw new Error(data.message);
  }
  
  return data;

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

  const response = await fetch(`${HOST}${ENDPOINT}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(penalty)
  });

  const data = await response.json();

  if (!response.ok) {
    if (data.error && data.error.name === "UserNotAuthorized") {
      throw new Error("Solo el recaudador puede actualizar multas");
    }

    throw new Error(data.message);
  }
  
  return data;
}

export async function deletePenalty({
  id,
  token
}: {
  id: number,
  token: string
}) {
  console.log({deletedPenalty: id})

  const response = await fetch(`${HOST}${ENDPOINT}/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    let { error } = await response.json();

    if (error.name === "UserNotAuthorized") {
      throw new Error("Solo el recaudador puede eliminar multas");
    }

    throw new Error(error.message);
  }
}