const Contact = require('../models/contact');
const logger = require('../utils/logger')

const createContact = async (contactData) => {
    try {
        const newContact = await Contact.create(contactData);
        return newContact;
    } catch (error) {
        logger.error(error)
        if (error.name === "SequelizeUniqueConstraintError") {
            // valores duplicados

            if (error.fields.dni) {
                throw new Error("duplicated dni", { value: error.fields.dni})
            }
            console.log(error.message)
        }
        
        console.log({error})
        throw new Error(`Could not create contact: ${error.message}`);
    }
};

const getContacts = async () => {
    try {
        const contacts = await Contact.findAll();
        return contacts;
    } catch (error) {
        logger.error(error)
        throw new Error(`Could not retrieve contacts: ${error.message}`);
    }
};

const getContactById = async (id) => {
    try {
        const contact = await Contact.findByPk(id);
        if (!contact) {
            throw new Error('Contact not found');
        }
        return contact;
    } catch (error) {
        logger.error(error)
        throw new Error(`Could not retrieve contact: ${error.message}`);
    }
};

const updateContact = async (id, contactData) => {
    try {
        const contact = await Contact.findByPk(id);
        if (!contact) {
            throw new Error('Contact not found');
        }
        await contact.update(contactData);
        return contact;
    } catch (error) {
        logger.error(error)
        throw new Error(`Could not update contact: ${error.message}`);
    }
};

const deleteContact = async (id) => {
    try {
        const contact = await Contact.findByPk(id);
        if (!contact) {
            throw new Error('Contact not found');
        }
        await contact.destroy();
    } catch (error) {
        logger.error(error)
        throw new Error(`Could not delete contact: ${error.message}`);
    }
};

module.exports = {
    createContact,
    getContacts,
    getContactById,
    updateContact,
    deleteContact,
};