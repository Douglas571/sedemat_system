// filesService.js
const fs = require('fs');
const path = require('path');
const { File } = require('../database/models'); // Adjust the path as necessary

const create = async (fileData) => {
  return await File.create(fileData);
};

const getById = async (id) => {
  const file = await File.findByPk(id);
  if (!file) throw new Error('File not found');
  return file;
};

const update = async (id, updateData) => {
  const file = await getById(id);
  return await file.update(updateData);
};

const remove = async (id) => {
  const file = await getById(id);

  let path = file.absolutePath;

  await file.destroy();
  // Delete the file from the filesystem
  if (fs.existsSync(path)) {
    fs.unlinkSync(path)
  }
};

const bulkDelete = async (ids) => {
  const files = await File.findAll({ where: { id: ids } });

  await Promise.all(files.map(async (file) => {
    const filePath = file.absolutePath;
    await file.destroy();
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }));

};

const getAll = async () => {
  return await File.findAll();
};

const listByPurpose = async (purpose) => {
  return await File.findAll({ where: { purpose } }); // Allows filtering by purpose
};

module.exports = {
  create,
  getById,
  update,
  delete: remove,
  getAll,
  listByPurpose,
  bulkDelete
};