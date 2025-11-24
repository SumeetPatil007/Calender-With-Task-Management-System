// public/assets/js/app.js
(() => {
  const api = (q, opts={}) => fetch('api.php' + q, opts).then(r => r.json());
  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));

  const state = {
    current: new Date(),
    selectedDate: new Date()
  };

  const monthLabel = $('#monthLabel');
  const calendarGrid = $('#calendarGrid');
  const tasksList = $('#tasksList');
  const selectedDateLabel = $('#selectedDateLabel');

  const taskModalEl = document.getElementById('taskModal');
  const taskModal = new bootstrap.Modal(taskModalEl);
  const taskForm = $('#taskForm');
  const addTaskBtn = $('#addTaskBtn');
  const deleteTaskBtn = $('#deleteTaskBtn');

  function formatDate(d) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth()+1).padStart(2,'0');
    const dd = String(d.getDate()).padStart(2,'0');
    return `${yyyy}-${mm}-${dd}`;
  }

  function renderMonth() {
    const year = state.current.getFullYear();
    const month = state.current.getMonth();
    monthLabel.textContent = state.current.toLocaleString(undefined, { month: 'long', year: 'numeric' });

    // first day of month
    const first = new Date(year, month, 1);
    const startDay = first.getDay(); // 0 Sun - 6 Sat
    const daysInMonth = new Date(year, month+1, 0).getDate();

    // get tasks for range (prev padding days to last padding)
    const from = new Date(year, month, 1 - startDay);
    const to = new Date(year, month, daysInMonth + (6 - ((first.getDay() + daysInMonth - 1) % 7)));
    const fromStr = formatDate(from);
    const toStr = formatDate(to);

    api(`?action=getTasksRange&from=${fromStr}&to=${toStr}`)
    .then(res => {
      const tasksByDate = {};
      (res.tasks || []).forEach(t => {
        tasksByDate[t.due_date] = tasksByDate[t.due_date] || [];
        tasksByDate[t.due_date].push(t);
      });

      // build grid html
      let html = '<div class="d-grid gap-2 calendar-weekdays" style="grid-template-columns: repeat(7,1fr)">';
      const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
      days.forEach(d => html += `<div class="text-center fw-semibold py-1">${d}</div>`);
      html += '</div>';

      html += '<div class="d-grid gap-2" style="grid-template-columns: repeat(7, 1fr)">';
      let dayPointer = new Date(from);
      while (dayPointer <= to) {
        const inMonth = dayPointer.getMonth() === month;
        const dateStr = formatDate(dayPointer);
        const tasks = tasksByDate[dateStr] || [];
        const marker = tasks.length ? `<div class="task-marker">${tasks.length}</div>` : '';
        const cls = inMonth ? 'day-cell' : 'day-cell day-cell--muted';
        const todayCls = (formatDate(new Date())===dateStr) ? ' today' : '';
        html += `<div class="${cls}${todayCls}" data-date="${dateStr}">
                  <div class="date-number">${dayPointer.getDate()}</div>
                  ${marker}
                </div>`;
        dayPointer.setDate(dayPointer.getDate()+1);
      }
      html += '</div>';
      calendarGrid.innerHTML = html;

      // attach click handlers
      $$('.day-cell').forEach(el => {
        el.addEventListener('click', () => {
          state.selectedDate = new Date(el.dataset.date);
          loadTasksForSelectedDate();
        });
      });

      // if selected date not in same month, keep it but show
      loadTasksForSelectedDate();
    });
  }

  function loadTasksForSelectedDate() {
    const dateStr = formatDate(state.selectedDate);
    selectedDateLabel.textContent = `Tasks — ${state.selectedDate.toDateString()}`;
    api(`?action=getTasks&date=${dateStr}`)
    .then(res => {
      const tasks = res.tasks || [];
      if (!tasks.length) {
        tasksList.innerHTML = '<div class="text-muted">No tasks for this date</div>';
        return;
      }
      tasksList.innerHTML = tasks.map(t => {
        const done = t.status === 'completed' ? 'text-decoration-line-through opacity-75' : '';
        const pri = t.priority === 'high' ? 'badge bg-danger' : (t.priority === 'medium' ? 'badge bg-warning text-dark' : 'badge bg-secondary');
        return `<div class="list-group-item d-flex justify-content-between align-items-start">
          <div>
            <div class="${done}"><strong>${escapeHtml(t.title)}</strong> <span class="${pri} ms-2">${t.priority}</span></div>
            <div class="small text-muted">${escapeHtml(t.category || '')}</div>
            <div class="small">${escapeHtml(t.description || '')}</div>
          </div>
          <div class="text-end">
            <button class="btn btn-sm btn-outline-success mb-1 toggleComplete" data-id="${t.id}">${t.status === 'completed' ? 'Unmark' : 'Complete'}</button>
            <button class="btn btn-sm btn-outline-primary editTask" data-id="${t.id}">Edit</button>
          </div>
        </div>`;
      }).join('');
      // attach handlers
      $$('.editTask').forEach(btn => btn.addEventListener('click', e => openEdit(parseInt(e.currentTarget.dataset.id))));
      $$('.toggleComplete').forEach(btn => btn.addEventListener('click', e => toggleComplete(parseInt(e.currentTarget.dataset.id))));
    });
  }

  function escapeHtml(s) {
    if (!s) return '';
    return s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  function toggleComplete(id) {
    fetch('api.php?action=toggleComplete', {
      method: 'POST',
      body: JSON.stringify({id}),
      headers: {'Content-Type':'application/json'}
    }).then(r=>r.json()).then(res => {
      loadTasksForSelectedDate();
      renderMonth();
    });
  }

  // open modal to add
  addTaskBtn.addEventListener('click', () => {
    $('#taskId').value = '';
    $('#title').value = '';
    $('#description').value = '';
    $('#priority').value = 'low';
    $('#category').value = '';
    $('#due_date').value = formatDate(state.selectedDate);
    deleteTaskBtn.style.display = 'none';
    taskModal.show();
  });

  function openEdit(id) {
    // fetch single by range for the selected date (we'll call getTasksRange with wide range and find by id)
    api(`?action=getTasksRange&from=1970-01-01&to=2100-12-31`).then(res => {
      const t = (res.tasks || []).find(x => parseInt(x.id) === id);
      if (!t) return alert('Task not found');
      $('#taskId').value = t.id;
      $('#title').value = t.title;
      $('#description').value = t.description || '';
      $('#priority').value = t.priority;
      $('#category').value = t.category;
      $('#due_date').value = t.due_date;
      deleteTaskBtn.style.display = 'inline-block';
      taskModal.show();
    });
  }

  taskForm.addEventListener('submit', e => {
    e.preventDefault();
    const payload = {
      id: $('#taskId').value ? parseInt($('#taskId').value) : undefined,
      title: $('#title').value,
      description: $('#description').value,
      due_date: $('#due_date').value,
      priority: $('#priority').value,
      category: $('#category').value,
      status: 'pending'
    };
    if (payload.id) {
      fetch('api.php?action=updateTask', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(payload)
      }).then(r=>r.json()).then(res => {
        taskModal.hide();
        renderMonth();
      });
    } else {
      fetch('api.php?action=addTask', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(payload)
      }).then(r=>r.json()).then(res => {
        taskModal.hide();
        renderMonth();
      });
    }
  });

  deleteTaskBtn.addEventListener('click', () => {
    const id = parseInt($('#taskId').value || 0);
    if (!id) return;
    if (!confirm('Delete this task?')) return;
    fetch('api.php?action=deleteTask', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({id})
    }).then(r=>r.json()).then(res => {
      taskModal.hide();
      renderMonth();
    });
  });

  // month navigation
  $('#prevMonth').addEventListener('click', () => { state.current.setMonth(state.current.getMonth()-1); renderMonth(); });
  $('#nextMonth').addEventListener('click', () => { state.current.setMonth(state.current.getMonth()+1); renderMonth(); });
  $('#todayBtn').addEventListener('click', () => { state.current = new Date(); state.selectedDate = new Date(); renderMonth(); });

  // initial load
  renderMonth();
})();
