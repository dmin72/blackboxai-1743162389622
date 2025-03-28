// Gestione dello stato dell'applicazione
const state = {
    currentDate: new Date(),
    events: [],
    selectedEventId: null
};

// Utility functions
const formatDate = (date) => {
    return date.toLocaleDateString('it-IT', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
};

const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('it-IT', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
};

const formatDateTimeForInput = (date) => {
    return date.toISOString().slice(0, 16);
};

const getCurrentDateTime = () => {
    const now = new Date();
    // Arrotonda al prossimo quarto d'ora
    const minutes = Math.ceil(now.getMinutes() / 15) * 15;
    now.setMinutes(minutes);
    now.setSeconds(0);
    now.setMilliseconds(0);
    return now;
};

// API calls
const api = {
    async getEvents() {
        try {
            console.log('Richiesta eventi in corso...');
            const response = await fetch('/api/events');
            if (!response.ok) throw new Error('Errore nel caricamento degli eventi');
            const data = await response.json();
            console.log('Risposta ricevuta:', data);
            return data.data || [];
        } catch (error) {
            console.error('Errore nella richiesta eventi:', error);
            throw error;
        }
    },

    async createEvent(eventData) {
        const response = await fetch('/api/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventData)
        });
        if (!response.ok) throw new Error('Errore nella creazione dell\'evento');
        const data = await response.json();
        return data.data;
    },

    async updateEvent(id, eventData) {
        const response = await fetch(`/api/events/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventData)
        });
        if (!response.ok) throw new Error('Errore nell\'aggiornamento dell\'evento');
        const data = await response.json();
        return data.data;
    },

    async deleteEvent(id) {
        const response = await fetch(`/api/events/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Errore nell\'eliminazione dell\'evento');
        return true;
    }
};

// Toast notifications
const showToast = (message, type = 'success') => {
    const toastContainer = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast p-4 rounded-lg shadow-lg ${
        type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } text-white`;
    toast.textContent = message;

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('hiding');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

// Calendar rendering
const renderCalendar = () => {
    const grid = document.getElementById('calendarGrid');
    const currentMonth = document.getElementById('currentMonth');
    
    // Aggiorna il titolo del mese
    currentMonth.textContent = state.currentDate.toLocaleDateString('it-IT', { 
        year: 'numeric', 
        month: 'long' 
    });

    // Calcola il primo giorno del mese
    const firstDay = new Date(state.currentDate.getFullYear(), state.currentDate.getMonth(), 1);
    const lastDay = new Date(state.currentDate.getFullYear(), state.currentDate.getMonth() + 1, 0);
    
    // Calcola il primo giorno da mostrare (può essere del mese precedente)
    const firstDayToShow = new Date(firstDay);
    firstDayToShow.setDate(firstDayToShow.getDate() - firstDay.getDay());

    grid.innerHTML = '';
    const today = new Date();

    // Crea 6 righe di 7 giorni
    for (let i = 0; i < 42; i++) {
        const currentDate = new Date(firstDayToShow);
        currentDate.setDate(currentDate.getDate() + i);
        
        const dayElement = document.createElement('div');
        dayElement.className = `calendar-day bg-white ${
            currentDate.getMonth() === state.currentDate.getMonth() 
                ? '' 
                : 'different-month'
        } ${
            currentDate.toDateString() === today.toDateString() 
                ? 'today' 
                : ''
        }`;

        // Container per il numero del giorno
        const dayNumber = document.createElement('div');
        dayNumber.className = 'text-sm font-semibold';
        dayNumber.textContent = currentDate.getDate();
        dayElement.appendChild(dayNumber);

        // Container per gli eventi
        const eventsContainer = document.createElement('div');
        eventsContainer.className = 'events-container';

        // Filtra e mostra gli eventi per questo giorno
        console.log('Controllo eventi per', currentDate.toDateString());
        console.log('Eventi disponibili:', state.events);
        const dayEvents = state.events.filter(event => {
            const eventDate = new Date(event.startTime);
            const matches = eventDate.toDateString() === currentDate.toDateString();
            if (matches) {
                console.log('Evento trovato per', currentDate.toDateString(), ':', event);
            }
            return matches;
        });

        dayEvents.forEach(event => {
            const eventElement = document.createElement('div');
            eventElement.className = 'event-item p-1 text-xs text-white rounded cursor-pointer mb-1';
            eventElement.style.backgroundColor = event.color || '#3B82F6';
            const eventText = `${formatTime(event.startTime)} ${event.title}`;
            console.log('Creazione evento:', eventText);
            eventElement.textContent = eventText;
            eventElement.addEventListener('click', (e) => {
                e.stopPropagation();
                openEventModal(event);
            });
            eventsContainer.appendChild(eventElement);
        });

        dayElement.appendChild(eventsContainer);

        // Aggiungi evento click per aggiungere nuovo evento
        dayElement.addEventListener('click', () => {
            openEventModal(null, currentDate);
        });

        grid.appendChild(dayElement);
    }
};

// Modal handling
const eventModal = document.getElementById('eventModal');
const eventForm = document.getElementById('eventForm');
const modalTitle = document.getElementById('modalTitle');
const deleteEventBtn = document.getElementById('deleteEventBtn');

const openEventModal = (event = null, date = null) => {
    state.selectedEventId = event?.id || null;
    modalTitle.textContent = event ? 'Modifica Evento' : 'Nuovo Evento';
    deleteEventBtn.style.display = event ? 'block' : 'none';

    // Popola il form
    document.getElementById('eventId').value = event?.id || '';
    document.getElementById('title').value = event?.title || '';
    document.getElementById('description').value = event?.description || '';
    
    if (event) {
        document.getElementById('startTime').value = formatDateTimeForInput(new Date(event.startTime));
        document.getElementById('endTime').value = formatDateTimeForInput(new Date(event.endTime));
    } else if (date) {
        const startTime = new Date(date);
        startTime.setHours(9, 0, 0, 0);
        const endTime = new Date(date);
        endTime.setHours(10, 0, 0, 0);
        
        document.getElementById('startTime').value = formatDateTimeForInput(startTime);
        document.getElementById('endTime').value = formatDateTimeForInput(endTime);
    } else {
        const now = getCurrentDateTime();
        const endTime = new Date(now);
        endTime.setHours(now.getHours() + 1);
        
        document.getElementById('startTime').value = formatDateTimeForInput(now);
        document.getElementById('endTime').value = formatDateTimeForInput(endTime);
    }
    
    document.getElementById('location').value = event?.location || '';
    document.getElementById('color').value = event?.color || '#3B82F6';

    eventModal.classList.remove('hidden');
};

const closeEventModal = () => {
    eventModal.classList.add('hidden');
    eventForm.reset();
    state.selectedEventId = null;
};

// Event listeners
document.getElementById('addEventBtn').addEventListener('click', () => openEventModal());
document.getElementById('closeModal').addEventListener('click', closeEventModal);

document.getElementById('prevMonth').addEventListener('click', () => {
    state.currentDate.setMonth(state.currentDate.getMonth() - 1);
    renderCalendar();
});

document.getElementById('nextMonth').addEventListener('click', () => {
    state.currentDate.setMonth(state.currentDate.getMonth() + 1);
    renderCalendar();
});

document.getElementById('todayBtn').addEventListener('click', () => {
    state.currentDate = new Date();
    renderCalendar();
});

deleteEventBtn.addEventListener('click', async () => {
    if (!state.selectedEventId) return;
    
    try {
        await api.deleteEvent(state.selectedEventId);
        state.events = state.events.filter(e => e.id !== state.selectedEventId);
        showToast('Evento eliminato con successo');
        closeEventModal();
        renderCalendar();
    } catch (error) {
        showToast(error.message, 'error');
    }
});

eventForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        startTime: document.getElementById('startTime').value,
        endTime: document.getElementById('endTime').value,
        location: document.getElementById('location').value,
        color: document.getElementById('color').value
    };

    try {
        if (state.selectedEventId) {
            const updatedEvent = await api.updateEvent(state.selectedEventId, formData);
            state.events = state.events.map(e => 
                e.id === state.selectedEventId ? updatedEvent : e
            );
            showToast('Evento aggiornato con successo');
        } else {
            const newEvent = await api.createEvent(formData);
            state.events.push(newEvent);
            showToast('Evento creato con successo');
        }
        
        closeEventModal();
        renderCalendar();
    } catch (error) {
        showToast(error.message, 'error');
    }
});

// Inizializzazione
const init = async () => {
    try {
        state.events = await api.getEvents();
        console.log('Eventi caricati:', state.events);
        renderCalendar();
    } catch (error) {
        console.error('Errore nel caricamento degli eventi:', error);
        showToast('Errore nel caricamento degli eventi', 'error');
    }
};

init();