// src/task_skript.js

// Получаем элементы
const modal = document.getElementById('addTaskModal');
const openBtn = document.getElementById('openModalBtn');
const cancelBtn = document.getElementById('cancelBtn');
const taskInput = document.getElementById('taskInput');
const taskDeadlineInput = document.getElementById('taskDeadline');
const todoColumn = document.getElementById('todo-column');
const inProgressColumn = document.getElementById('in-progress-column');
const doneColumn = document.getElementById('done-column');

const columns = {
  todo: todoColumn,
  'in-progress': inProgressColumn,
  done: doneColumn
};

// --- ФУНКЦИЯ СОХРАНЕНИЯ ---
function saveTasksToLocalStorage() {
  const tasks = [];

  // Собираем задачи из всех колонок
  Object.keys(columns).forEach(key => {
    const col = columns[key];
    // ВАЖНО: Проходим только по карточкам, которые находятся непосредственно в колонке
    col.querySelectorAll('.task-card').forEach(card => {
      const content = card.querySelector('.task-content').textContent;
      const deadline = card.dataset.deadline;
      const startDate = card.dataset.startdate;
      const checkbox = card.querySelector('.checkboxs');
      tasks.push({
        text: content,
        status: key, // 'todo', 'in-progress', 'done'
        checked: checkbox.checked,
        deadline: deadline,
        startDate: startDate
      });
    });
  });

  try {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    console.log("Задачи успешно сохранены в localStorage.");
  } catch (e) {
    console.error("Ошибка при сохранении задач в localStorage:", e);
  }
}

// --- ФУНКЦИЯ ЗАГРУЗКИ ---
function loadTasksFromLocalStorage() {
  let savedTasks = localStorage.getItem('tasks');
  if (!savedTasks) {
    console.log("Нет сохраненных задач в localStorage.");
    return;
  }

  let tasks;
  try {
    tasks = JSON.parse(savedTasks);
  } catch (e) {
    console.error("Ошибка при парсинге задач из localStorage:", e);
    alert('Произошла ошибка при чтении задач. Проверьте консоль разработчика.');
    return;
  }

  if (!Array.isArray(tasks)) {
    console.warn("Данные в localStorage не являются массивом задач. Сброс.");
    localStorage.removeItem('tasks'); // Очищаем, если данные битые
    return;
  }

  // --- КЛЮЧЕВОЕ ИЗМЕНЕНИЕ: ОЧИСТКА КОЛОНОК ПЕРЕД ЗАГРУЗКОЙ ---
  Object.keys(columns).forEach(key => {
    columns[key].innerHTML = ''; // Очищаем содержимое колонки
  });
  // --- КОНЕЦ ИЗМЕНЕНИЯ ---

  tasks.forEach(task => {
    // Передаем дедлайн и дату начала при создании карточки
    const card = createTaskCard(task.text, task.status, task.deadline, task.startDate);
    const checkbox = card.querySelector('.checkboxs');
    if (checkbox) {
        checkbox.checked = task.checked;
    }
    // Проверяем, что колонка существует перед добавлением
    const targetColumn = columns[task.status];
    if (targetColumn) {
        targetColumn.appendChild(card);
    } else {
        console.warn(`Колонка для статуса "${task.status}" не найдена.`);
    }
  });
  console.log("Задачи успешно загружены из localStorage и отображены.");
}

function getTodayDate() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

// Принимаем deadline и startDate
function createTaskCard(text, status = 'todo', deadline = null, startDate = null) {
  const card = document.createElement('div');
  card.className = 'task-card';
  card.dataset.status = status;

  // Сохраняем дедлайн и дату начала в data-атрибуты
  if (deadline) card.dataset.deadline = deadline;
  if (startDate) card.dataset.startdate = startDate;

  const content = document.createElement('div');
  content.className = 'task-content';
  content.textContent = text;

  // Создаем элементы для отображения дат
  const dateInfo = document.createElement('div');
  dateInfo.className = 'task-dates';
  dateInfo.style.fontSize = '0.85em';
  dateInfo.style.color = '#666';
  dateInfo.style.marginTop = '4px';

  const displayStartDate = startDate ? new Date(startDate).toLocaleDateString('ru-RU') : 'Нет';
  const displayDeadline = deadline ? new Date(deadline).toLocaleDateString('ru-RU') : 'Нет';

  dateInfo.textContent = `${displayStartDate} | ${displayDeadline}`;

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'checkboxs';

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.textContent = 'Удалить';

  card.appendChild(content);
  card.appendChild(dateInfo);
  card.appendChild(checkbox);
  card.appendChild(deleteBtn);

  checkbox.addEventListener('change', () => handleCheckboxChange(card, checkbox));
  deleteBtn.addEventListener('click', () => {
    card.remove();
    saveTasksToLocalStorage(); // Сохраняем после удаления
  });

  return card;
}

function handleCheckboxChange(card, checkbox) {
  const currentStatus = card.dataset.status;
  let nextColumn;

  if (currentStatus === 'todo' && checkbox.checked) {
    nextColumn = columns['in-progress'];
    card.dataset.status = 'in-progress';
  } else if (currentStatus === 'in-progress' && checkbox.checked) {
    nextColumn = columns['done'];
    card.dataset.status = 'done';
  } else {
    // Если галочка снята или статус не меняется, не делаем ничего
    return;
  }

  if (nextColumn) {
    nextColumn.appendChild(card);
    checkbox.checked = false; // Снимаем галочку после перемещения
    saveTasksToLocalStorage(); // Сохраняем после перемещения
  }
}

// --- ИСПРАВЛЕННАЯ ФУНКЦИЯ ЭКСПОРТА ---
function exportTasksToICS() {
  let savedTasks = localStorage.getItem('tasks');
  if (!savedTasks) {
    alert('Нет задач для экспорта.');
    return;
  }

  let tasks;
  try {
    tasks = JSON.parse(savedTasks);
  } catch (e) {
    console.error("Ошибка при парсинге задач для экспорта:", e);
    alert('Произошла ошибка при подготовке задач к экспорту. Проверьте консоль разработчика.');
    return;
  }

  if (!Array.isArray(tasks) || tasks.length === 0) {
    alert('Нет задач для экспорта.');
    return;
  }

  let icsContent = "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Ваше Приложение Задач//RU\r\n";

  tasks.forEach(task => {
    let uid = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    let dtstamp = new Date().toISOString().replace(/\-|:|\..*/g, '');
    let summary = `Задача: ${task.text}`;
    let description = `Статус: ${task.status}. Дата начала: ${task.startDate || 'Не указана'}. Дедлайн: ${task.deadline || 'Не указан'}.`;
    let dtstart = task.deadline || task.startDate;

    if (!dtstart) {
      console.warn(`Задача "${task.text}" не имеет даты начала или дедлайна, пропущена в ICS.`);
      return; // Пропускаем задачу без даты
    }

    const [year, month, day] = dtstart.split('-');
    if (!year || !month || !day) {
        console.warn(`Неверный формат даты для задачи "${task.text}": ${dtstart}, пропущена в ICS.`);
        return; // Пропускаем задачу с неверной датой
    }
    const icsDate = `${year}${month}${day}`;

    icsContent += [
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${dtstamp}Z`,
      `DTSTART;VALUE=DATE:${icsDate}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      "END:VEVENT\r\n"
    ].join("\r\n");
  });

  icsContent += "END:VCALENDAR";

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
  const filename = `tasks_export_${new Date().toISOString().slice(0, 10)}.ics`;

  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    console.log("Файл ICS успешно подготовлен для скачивания.");
  } else {
    console.error("Браузер не поддерживает атрибут download для автоматического скачивания.");
    alert("Ваш браузер не поддерживает автоматическое скачивание файла. Пожалуйста, используйте другой браузер.");
  }
}

// --- ИНИЦИАЛИЗАЦИЯ ---
document.addEventListener('DOMContentLoaded', () => {
  console.log("DOMContentLoaded сработал на tasks.html");
  loadTasksFromLocalStorage(); // Загружаем задачи из localStorage
  setupEventListeners();       // Устанавливаем обработчики
  setupExportEventListeners(); // Устанавливаем обработчик экспорта
});

function setupEventListeners() {
  openBtn.addEventListener('click', () => {
    modal.showModal();
    taskInput.value = '';
    taskDeadlineInput.value = '';
    taskDeadlineInput.min = getTodayDate();
  });

  cancelBtn.addEventListener('click', () => {
    modal.close();
  });

  modal.addEventListener('click', (e) => {
    const rect = modal.getBoundingClientRect();
    if (
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom
    ) {
      modal.close();
    }
  });

  modal.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault();
    const taskText = taskInput.value.trim();
    const deadlineValue = taskDeadlineInput.value;

    if (taskText && deadlineValue) {
      const startDateValue = getTodayDate();
      const newCard = createTaskCard(taskText, 'todo', deadlineValue, startDateValue);
      columns['todo'].appendChild(newCard);
      saveTasksToLocalStorage(); // Сохраняем после добавления
      modal.close();
    } else {
      if (!taskText) {
        alert("Пожалуйста, введите текст задачи.");
      } else if (!deadlineValue) {
        alert("Пожалуйста, выберите дедлайн для задачи.");
      }
    }
  });
}

function setupExportEventListeners() {
  const exportBtn = document.getElementById('exportICSBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportTasksToICS);
  } else {
    console.warn("Кнопка экспорта ICS не найдена в DOM.");
  }
}