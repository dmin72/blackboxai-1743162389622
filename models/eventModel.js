const fs = require('fs').promises;
const path = require('path');

const eventsFilePath = path.join(__dirname, '../data/events.json');

class EventModel {
  static async getAllEvents() {
    try {
      const data = await fs.readFile(eventsFilePath, 'utf8');
      return JSON.parse(data).events;
    } catch (error) {
      throw new Error('Errore durante la lettura degli eventi');
    }
  }

  static async createEvent(eventData) {
    try {
      const data = await fs.readFile(eventsFilePath, 'utf8');
      const { events } = JSON.parse(data);
      
      const newEvent = {
        id: Date.now().toString(),
        ...eventData,
        createdAt: new Date().toISOString()
      };

      events.push(newEvent);

      await fs.writeFile(eventsFilePath, JSON.stringify({ events }, null, 2));
      return newEvent;
    } catch (error) {
      throw new Error('Errore durante la creazione dell\'evento');
    }
  }

  static async updateEvent(eventId, eventData) {
    try {
      const data = await fs.readFile(eventsFilePath, 'utf8');
      const { events } = JSON.parse(data);
      
      const eventIndex = events.findIndex(event => event.id === eventId);
      if (eventIndex === -1) {
        throw new Error('Evento non trovato');
      }

      events[eventIndex] = {
        ...events[eventIndex],
        ...eventData,
        updatedAt: new Date().toISOString()
      };

      await fs.writeFile(eventsFilePath, JSON.stringify({ events }, null, 2));
      return events[eventIndex];
    } catch (error) {
      throw new Error('Errore durante l\'aggiornamento dell\'evento');
    }
  }

  static async deleteEvent(eventId) {
    try {
      const data = await fs.readFile(eventsFilePath, 'utf8');
      const { events } = JSON.parse(data);
      
      const eventIndex = events.findIndex(event => event.id === eventId);
      if (eventIndex === -1) {
        throw new Error('Evento non trovato');
      }

      events.splice(eventIndex, 1);

      await fs.writeFile(eventsFilePath, JSON.stringify({ events }, null, 2));
      return true;
    } catch (error) {
      throw new Error('Errore durante l\'eliminazione dell\'evento');
    }
  }

  static async getEventById(eventId) {
    try {
      const data = await fs.readFile(eventsFilePath, 'utf8');
      const { events } = JSON.parse(data);
      
      const event = events.find(event => event.id === eventId);
      if (!event) {
        throw new Error('Evento non trovato');
      }

      return event;
    } catch (error) {
      throw new Error('Errore durante la ricerca dell\'evento');
    }
  }
}

module.exports = EventModel;