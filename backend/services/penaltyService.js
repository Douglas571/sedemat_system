const { Penalty, PenaltyType, GrossIncomeInvoice, User } = require('../database/models');

const grossIncomeInvoiceService = require('./grossIncomeInvoiceService');

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

  if (data.grossIncomeInvoiceId) {
    const grossIncomeInvoice = await grossIncomeInvoiceService.getGrossIncomeInvoiceById(data.grossIncomeInvoiceId);
    if (!grossIncomeInvoice) {
      throw new Error('Gross Income Invoice not found');
    }

    if (grossIncomeInvoice.settlement) {
      throw new Error('Gross Income Invoice has a settled invoice associated');
    }
  }
  
  const penalty = await Penalty.create({
    ...data,
    createdByUserId: user.id,
  });

  if (data.grossIncomeInvoiceId) {
    await grossIncomeInvoiceService.updatePaidAtProperty(data.grossIncomeInvoiceId)
  }

  return penalty;
};

const updatePenalty = async ({id, data, user}) => {

  canCreateUpdateDeletePenalty(user)

  const penalty = await Penalty.findByPk(id);

  if (!penalty) {
    throw new Error('Penalty not found');
  }

  if (penalty.grossIncomeInvoiceId) {
    const grossIncomeInvoice = await grossIncomeInvoiceService.getGrossIncomeInvoiceById(data.grossIncomeInvoiceId);
    if (!grossIncomeInvoice) {
      throw new Error('Gross Income Invoice not found');
    }

    if (grossIncomeInvoice.settlement) {
      throw new Error('Gross Income Invoice has a settled invoice associated');
    }
  }

  await penalty.update(data);

  if (data.grossIncomeInvoiceId) {
    await grossIncomeInvoiceService.updatePaidAtProperty(data.grossIncomeInvoiceId)
  }

  return penalty;
};

const deletePenalty = async ({id, user}) => {

  canCreateUpdateDeletePenalty(user)

  const penalty = await Penalty.findByPk(id);
  if (!penalty) {
    throw new Error('Penalty not found');
  }
  await penalty.destroy();

  if (penalty.grossIncomeInvoiceId) {
    await grossIncomeInvoiceService.updatePaidAtProperty(penalty.grossIncomeInvoiceId)
  }

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
