// src/calendar.js

// Импортируем ядро FullCalendar
import { Calendar } from '@fullcalendar/core';

// Импортируем плагин для отображения месяца
import dayGridPlugin from '@fullcalendar/daygrid';


let calendar = null;

function fetchTasksForCalendar(fetchInfo, successCallback, failureCallback) {
  // Получаем задачи из localStorage
  const tasks = JSON.parse(localStorage.getItem('tasks')) || [];

  // Преобразуем задачи в формат событий FullCalendar
  const events = tasks.map(task => {
    // Определяем дату начала события для календаря
    let dateForCalendar = task.deadline || task.startDate;
    if (!dateForCalendar) {
      console.warn(`Задача "${task.text}" не имеет даты начала или дедлайна, не будет отображена в календаре.`);
      return null;
    }

    return {
      title: task.text,
      start: dateForCalendar,
      extendedProps: {
        deadline: task.deadline,
        startDate: task.startDate,
        status: task.status
      },
      backgroundColor: task.status === 'done' ? '#4caf50' :
                   task.status === 'in-progress' ? '#2196f3' :
                   '#ff9800'
    };
  }).filter(event => event !== null);

  successCallback(events);
}

function initializeCalendar() {
  const calendarEl = document.getElementById('calendar');

  if (calendarEl) {
    calendar = new Calendar(calendarEl, {
      plugins: [dayGridPlugin],
      initialView: 'dayGridMonth',
      locale: 'ru',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,dayGridWeek,dayGridDay'
      },
      events: fetchTasksForCalendar,
      eventContent: function(arg) {
        let title = arg.event.title;
        let deadline = arg.event.extendedProps.deadline;
        let startDate = arg.event.extendedProps.startDate;
        let status = arg.event.extendedProps.status;

        let titleEl = document.createElement('div');
        titleEl.innerText = title;
        titleEl.style.fontWeight = 'bold';
        titleEl.style.fontSize = '1.2em';

        let startDateEl = document.createElement('div');
        startDateEl.innerText = `Начало: ${startDate || 'Не указана'}`;
        startDateEl.style.fontSize = '1.2em';
        startDateEl.style.color = '#000000ff';

        let deadlineEl = document.createElement('div');
        deadlineEl.innerText = `Дедлайн: ${deadline || 'Не указан'}`;
        deadlineEl.style.fontSize = '1.2em';
        deadlineEl.style.color = '#ffffffff';

        let statusEl = document.createElement('div');
        statusEl.innerText = `Статус: ${status}`;
        statusEl.style.fontSize = '1.2em';
        statusEl.style.color = '#000000ff';

        let wrapper = document.createElement('div');
        wrapper.appendChild(titleEl);
        if (startDate) wrapper.appendChild(startDateEl);
        if (deadline) wrapper.appendChild(deadlineEl);
        if (status) wrapper.appendChild(statusEl);

        return { domNodes: [wrapper] };
      }
    });

    calendar.render();
  } else {
    console.error("Элемент #calendar не найден в DOM.");
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initializeCalendar();
});