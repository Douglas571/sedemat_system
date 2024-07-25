const Person = require('../models/person');
const logger = require('../utils/logger');

const createPerson = async (personData) => {
    try {
        const newPerson = await Person.create(personData);
        return newPerson;
    } catch (error) {
        logger.error(error);
        if (error.name === "SequelizeUniqueConstraintError") {
            // valores duplicados

            if (error.fields.dni) {
                throw new Error("duplicated dni", { value: error.fields.dni });
            }
            console.log(error.message);
        }
        
        console.log({ error });
        throw new Error(`Could not create person: ${error.message}`);
    }
};

const getPeople = async () => {
    try {
        const people = await Person.findAll();
        return people;
    } catch (error) {
        logger.error(error);
        throw new Error(`Could not retrieve people: ${error.message}`);
    }
};

const getPersonById = async (id) => {
    try {
        const person = await Person.findByPk(id);
        if (!person) {
            throw new Error('Person not found');
        }
        return person;
    } catch (error) {
        logger.error(error);
        throw new Error(`Could not retrieve person: ${error.message}`);
    }
};

const updatePerson = async (id, personData) => {
    try {
        const person = await Person.findByPk(id);
        if (!person) {
            throw new Error('Person not found');
        }
        await person.update(personData);
        return person;
    } catch (error) {
        logger.error(error);
        throw new Error(`Could not update person: ${error.message}`);
    }
};

const deletePerson = async (id) => {
    try {
        const person = await Person.findByPk(id);
        if (!person) {
            throw new Error('Person not found');
        }
        await person.destroy();
    } catch (error) {
        logger.error(error);
        throw new Error(`Could not delete person: ${error.message}`);
    }
};

module.exports = {
    createPerson,
    getPeople,
    getPersonById,
    updatePerson,
    deletePerson,
};