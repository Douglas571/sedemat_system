const { Penalty, PenaltyType, GrossIncomeInvoice, User } = require('../database/models');

const ROLES = require('../utils/auth/roles');

function canCreateUpdateDeletePenalty(user) {

  if (!user || ![ROLES.COLLECTOR].includes(user.role.id)) {
    let error = new Error('User not authorized');
    error.name = 'UserNotAuthorized';
    throw error;
  }
}

const createPenalty = async ({data, user}) => {

  canCreateUpdateDeletePenalty(user)
  
  const penalty = await Penalty.create({
    ...data,
    createdByUserId: user.id,
  });
  return penalty;
};

const updatePenalty = async ({id, data, user}) => {

  canCreateUpdateDeletePenalty(user)

  const penalty = await Penalty.findByPk(id);

  console.log({data})
  if (!penalty) {
    throw new Error('Penalty not found');
  }
  await penalty.update(data);
  return penalty;
};

const deletePenalty = async ({id, user}) => {

  canCreateUpdateDeletePenalty(user)

  const penalty = await Penalty.findByPk(id);
  if (!penalty) {
    throw new Error('Penalty not found');
  }
  await penalty.destroy();
  return penalty;
};

const getPenaltyById = async ({id, user}) => {
  const penalty = await Penalty.findByPk(id, {
    include: [
      { model: PenaltyType, as: 'penaltyType' },
      { model: GrossIncomeInvoice, as: 'grossIncomeInvoice' },
      { model: User, as: 'createdByUser' },
    ],
  });
  if (!penalty) {
    throw new Error('Penalty not found');
  }
  return penalty;
};

const getAllPenalties = async ({user}) => {
  return await Penalty.findAll({
    include: [
      { model: PenaltyType, as: 'penaltyType' },
      { model: GrossIncomeInvoice, as: 'grossIncomeInvoice' },
      { model: User, as: 'createdByUser' },
    ],
  });
};

const getAllPenaltyTypes = async () => {
  return await PenaltyType.findAll();
}

module.exports = {
  createPenalty,
  updatePenalty,
  deletePenalty,
  getPenaltyById,
  getAllPenalties,
  getAllPenaltyTypes
};
