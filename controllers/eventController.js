const EventModel = require('../models/eventModel');

class EventController {
  static async getEvents(req, res) {
    try {
      const events = await EventModel.getAllEvents();
      res.json({ success: true, data: events });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async createEvent(req, res) {
    try {
      const { title, description, startTime, endTime, location, color } = req.body;

      // Validazione base dei dati
      if (!title || !startTime || !endTime) {
        return res.status(400).json({
          success: false,
          error: 'Titolo, ora di inizio e ora di fine sono campi obbligatori'
        });
      }

      // Validazione delle date
      const start = new Date(startTime);
      const end = new Date(endTime);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({
          success: false,
          error: 'Date non valide'
        });
      }

      if (start >= end) {
        return res.status(400).json({
          success: false,
          error: 'La data di inizio deve essere precedente alla data di fine'
        });
      }

      const eventData = {
        title,
        description,
        startTime,
        endTime,
        location,
        color
      };

      const newEvent = await EventModel.createEvent(eventData);
      res.status(201).json({ success: true, data: newEvent });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async updateEvent(req, res) {
    try {
      const { id } = req.params;
      const { title, description, startTime, endTime, location, color } = req.body;

      // Validazione base dei dati
      if (!title || !startTime || !endTime) {
        return res.status(400).json({
          success: false,
          error: 'Titolo, ora di inizio e ora di fine sono campi obbligatori'
        });
      }

      // Validazione delle date
      const start = new Date(startTime);
      const end = new Date(endTime);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({
          success: false,
          error: 'Date non valide'
        });
      }

      if (start >= end) {
        return res.status(400).json({
          success: false,
          error: 'La data di inizio deve essere precedente alla data di fine'
        });
      }

      const eventData = {
        title,
        description,
        startTime,
        endTime,
        location,
        color
      };

      const updatedEvent = await EventModel.updateEvent(id, eventData);
      res.json({ success: true, data: updatedEvent });
    } catch (error) {
      if (error.message === 'Evento non trovato') {
        res.status(404).json({ success: false, error: error.message });
      } else {
        res.status(500).json({ success: false, error: error.message });
      }
    }
  }

  static async deleteEvent(req, res) {
    try {
      const { id } = req.params;
      await EventModel.deleteEvent(id);
      res.json({ success: true, message: 'Evento eliminato con successo' });
    } catch (error) {
      if (error.message === 'Evento non trovato') {
        res.status(404).json({ success: false, error: error.message });
      } else {
        res.status(500).json({ success: false, error: error.message });
      }
    }
  }

  static async getEventById(req, res) {
    try {
      const { id } = req.params;
      const event = await EventModel.getEventById(id);
      res.json({ success: true, data: event });
    } catch (error) {
      if (error.message === 'Evento non trovato') {
        res.status(404).json({ success: false, error: error.message });
      } else {
        res.status(500).json({ success: false, error: error.message });
      }
    }
  }
}

module.exports = EventController;