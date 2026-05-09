/**
 * Visual Calendar Component
 * Handles date selection and time slot management
 */

class VisualCalendar {
    constructor(config) {
        this.containerId = config.containerId;
        this.onDateSelect = config.onDateSelect || (() => { });
        this.onSlotSelect = config.onSlotSelect || (() => { });

        this.currentDate = new Date();
        this.selectedDate = null;
        this.selectedSlot = null;
        this.availableSlots = {}; // caching slots

        this.init();
    }

    init() {
        this.render();
        this.attachEventListeners();
    }

    render() {
        const container = document.getElementById(this.containerId);
        if (!container) return;

        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth(); // 0-indexed

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const startingDay = firstDay.getDay(); // 0 (Sun) - 6 (Sat)
        const totalDays = lastDay.getDate();

        const monthName = firstDay.toLocaleString('default', { month: 'long', year: 'numeric' });

        let html = `
            <div class="calendar-header">
                <button class="calendar-nav-btn" id="prevMonth"><i class="fas fa-chevron-left"></i></button>
                <div class="current-month">${monthName}</div>
                <button class="calendar-nav-btn" id="nextMonth"><i class="fas fa-chevron-right"></i></button>
            </div>
            
            <div class="calendar-grid">
                <div class="calendar-day-header">Sun</div>
                <div class="calendar-day-header">Mon</div>
                <div class="calendar-day-header">Tue</div>
                <div class="calendar-day-header">Wed</div>
                <div class="calendar-day-header">Thu</div>
                <div class="calendar-day-header">Fri</div>
                <div class="calendar-day-header">Sat</div>
        `;

        // Empty slots for previous month
        for (let i = 0; i < startingDay; i++) {
            html += `<div class="calendar-day empty"></div>`;
        }

        // Days
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let day = 1; day <= totalDays; day++) {
            const date = new Date(year, month, day);
            const isToday = date.getTime() === today.getTime();
            const isPast = date < today;
            const isSelected = this.selectedDate && date.getTime() === this.selectedDate.getTime();

            let classes = ['calendar-day'];
            if (isToday) classes.push('today');
            if (isPast) classes.push('disabled');
            if (isSelected) classes.push('selected');

            // Randomly mark availability for simulation demo (in real app, check against fetched data)
            if (!isPast && day % 2 !== 0) classes.push('has-slots');

            html += `
                <div class="${classes.join(' ')}" data-day="${day}">
                    ${day}
                </div>
            `;
        }

        html += `</div>
            <div class="legend">
                <div class="legend-item"><span class="dot" style="background:var(--primary-color)"></span> Selected</div>
                <div class="legend-item"><span class="dot" style="background:#10b981"></span> Available</div>
            </div>
            <div id="timeSlotsArea" class="time-slots-container">
                <h4>Available Time Slots</h4>
                <div id="slotsGrid" class="time-slots-grid"></div>
            </div>
        `;

        container.innerHTML = html;
        this.attachEventListeners();
    }

    attachEventListeners() {
        document.getElementById('prevMonth').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.render();
        });

        document.getElementById('nextMonth').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.render();
        });

        const days = document.querySelectorAll('.calendar-day:not(.disabled):not(.empty)');
        days.forEach(day => {
            day.addEventListener('click', (e) => {
                // Deselect others
                days.forEach(d => d.classList.remove('selected'));
                e.target.classList.add('selected');

                const dayNum = parseInt(e.target.dataset.day);
                this.selectedDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), dayNum);

                this.renderTimeSlots(this.selectedDate);
                this.onDateSelect(this.selectedDate);
            });
        });
    }

    generateTimeSlots() {
        // Mock time slots generation - ideally fetch from API based on doctorId & date
        const slots = [];
        const startHour = 9;
        const endHour = 17;

        for (let hour = startHour; hour < endHour; hour++) {
            slots.push(`${hour}:00`);
            slots.push(`${hour}:30`);
        }
        return slots;
    }

    renderTimeSlots(date) {
        const slotsArea = document.getElementById('timeSlotsArea');
        const slotsGrid = document.getElementById('slotsGrid');

        slotsArea.classList.add('show');
        const slots = this.generateTimeSlots();

        slotsGrid.innerHTML = slots.map(time => `
            <div class="time-slot" onclick="window.calendarInstance.selectTimeSlot(this, '${time}')">
                ${time}
            </div>
        `).join('');
    }

    selectTimeSlot(element, time) {
        document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
        element.classList.add('selected');
        this.selectedSlot = time;
        this.onSlotSelect(time);
    }
}

// Global instance helper
window.initCalendar = function (containerId, onSelect) {
    window.calendarInstance = new VisualCalendar({
        containerId: containerId,
        onDateSelect: (date) => console.log('Date selected:', date),
        onSlotSelect: (time) => {
            // Update hidden inputs or state
            if (onSelect) onSelect(window.calendarInstance.selectedDate, time);
        }
    });
}
