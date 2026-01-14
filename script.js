let dailyTasks = JSON.parse(localStorage.getItem('dailyTasks')) || [
    { id: 1, name: 'Workout', alternatives: ['Gym', 'Yoga'], completed: {}, streak: 0 },
    { id: 2, name: 'Read', alternatives: ['Book', 'Kindle'], completed: {}, streak: 0 }
];

let weeklyTasks = JSON.parse(localStorage.getItem('weeklyTasks')) || [
    { id: 101, name: 'Go out', alternatives: ['Dinner', 'Movie'], completed: {} }
];

let currentDate = new Date();

function getDayKey(date) {
    return date.toISOString().split('T')[0];
}

function getWeekKey(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return `${d.getFullYear()}-W${weekNo}`;
}

function save() {
    localStorage.setItem('dailyTasks', JSON.stringify(dailyTasks));
    localStorage.setItem('weeklyTasks', JSON.stringify(weeklyTasks));
}

function render() {
    const dateStr = currentDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    document.getElementById('currentDateDisplay').innerText = dateStr;
    
    renderList('dailyTasksList', dailyTasks, true);
    renderList('weeklyTasksList', weeklyTasks, false);
}

function renderList(elementId, tasks, isDaily) {
    const list = document.getElementById(elementId);
    list.innerHTML = '';
    const key = isDaily ? getDayKey(currentDate) : getWeekKey(currentDate);
    
    tasks.forEach((task, index) => {
        const isCompleted = task.completed[key] || false;
        const card = document.createElement('div');
        card.className = `task-card ${isCompleted ? 'completed' : ''}`;
        card.innerHTML = `
            <div class="task-main">
                <div class="move-controls">
                    <button class="move-btn" onclick="move(${task.id}, ${isDaily}, -1)" ${index === 0 ? 'disabled' : ''}>▲</button>
                    <button class="move-btn" onclick="move(${task.id}, ${isDaily}, 1)" ${index === tasks.length - 1 ? 'disabled' : ''}>▼</button>
                </div>
                <button class="check-btn ${isCompleted ? 'checked' : ''}" onclick="toggle(${task.id}, ${isDaily})">
                    ${isCompleted ? '✓' : '○'}
                </button>
                <span class="task-name">
                    ${task.name}
                    ${isDaily ? `<span class="streak-inline">(${task.streak} 🔥)</span>` : ''}
                </span>
                ${!isDaily ? `<span class="weekly-progress">${isCompleted ? '✅ Done' : '⏳ Pending'}</span>` : ''}
                <button class="swap-btn" onclick="toggleAlts(${task.id}, ${isDaily})">↔️</button>
                <button class="delete-btn" onclick="remove(${task.id}, ${isDaily})">✕</button>
            </div>
            <div id="alts-${task.id}" class="alternatives hidden">
                <div class="alt-header">
                    <span>Swap with:</span>
                    <input type="text" id="new-alt-input-${task.id}" placeholder="Add alternative...">
                    <button onclick="addAlt(${task.id}, ${isDaily})">Add</button>
                </div>
                <div class="alt-list">
                    ${task.alternatives.map(alt => `<button class="alt-btn" onclick="swap(${task.id}, ${isDaily}, '${alt}')">${alt}</button>`).join('')}
                </div>
            </div>
        `;
        list.appendChild(card);
    });
}

window.changeDate = (days) => {
    currentDate.setDate(currentDate.getDate() + days);
    render();
};

window.toggle = (id, isDaily) => {
    let tasks = isDaily ? dailyTasks : weeklyTasks;
    let t = tasks.find(x => x.id === id);
    const key = isDaily ? getDayKey(currentDate) : getWeekKey(currentDate);
    
    const wasCompleted = !!t.completed[key];
    t.completed[key] = !wasCompleted;
    
    if (isDaily) {
        // Simple streak logic: check consecutive days backwards from today
        // This is a bit complex for a real streak, but for this app we'll update it based on the action
        if (t.completed[key]) {
            t.streak++;
        } else {
            t.streak = Math.max(0, t.streak - 1);
        }
    }
    
    save(); render();
};

window.addAlt = (id, isDaily) => {
    const input = document.getElementById(`new-alt-input-${id}`);
    const val = input.value.trim();
    if (val) {
        let tasks = isDaily ? dailyTasks : weeklyTasks;
        let t = tasks.find(x => x.id === id);
        if (!t.alternatives.includes(val)) {
            t.alternatives.push(val);
            save(); render();
        }
        input.value = '';
    }
};

window.remove = (id, isDaily) => {
    if (isDaily) dailyTasks = dailyTasks.filter(x => x.id !== id);
    else weeklyTasks = weeklyTasks.filter(x => x.id !== id);
    save(); render();
};

window.move = (id, isDaily, dir) => {
    let tasks = isDaily ? dailyTasks : weeklyTasks;
    let idx = tasks.findIndex(x => x.id === id);
    let newIdx = idx + dir;
    if (newIdx >= 0 && newIdx < tasks.length) {
        [tasks[idx], tasks[newIdx]] = [tasks[newIdx], tasks[idx]];
        save(); render();
    }
};

window.toggleAlts = (id, isDaily) => {
    document.getElementById(`alts-${id}`).classList.toggle('hidden');
};

window.swap = (id, isDaily, newName) => {
    let tasks = isDaily ? dailyTasks : weeklyTasks;
    let t = tasks.find(x => x.id === id);
    let oldName = t.name;
    t.name = newName;
    t.alternatives = t.alternatives.filter(x => x !== newName);
    t.alternatives.push(oldName);
    save(); render();
};

document.getElementById('addDailyBtn').onclick = () => document.getElementById('dailyAddForm').classList.toggle('hidden');
document.getElementById('addWeeklyBtn').onclick = () => document.getElementById('weeklyAddForm').classList.toggle('hidden');

document.getElementById('saveDailyBtn').onclick = () => {
    const name = document.getElementById('dailyTaskName').value;
    const alts = document.getElementById('dailyTaskAlts').value.split(',').map(x => x.trim()).filter(x => x);
    if (name) {
        dailyTasks.push({ id: Date.now(), name, alternatives: alts, completed: {}, streak: 0 });
        document.getElementById('dailyTaskName').value = '';
        document.getElementById('dailyTaskAlts').value = '';
        document.getElementById('dailyAddForm').classList.add('hidden');
        save(); render();
    }
};

document.getElementById('saveWeeklyBtn').onclick = () => {
    const name = document.getElementById('weeklyTaskName').value;
    const alts = document.getElementById('weeklyTaskAlts').value.split(',').map(x => x.trim()).filter(x => x);
    if (name) {
        weeklyTasks.push({ id: Date.now(), name, alternatives: alts, completed: {} });
        document.getElementById('weeklyTaskName').value = '';
        document.getElementById('weeklyTaskAlts').value = '';
        document.getElementById('weeklyAddForm').classList.add('hidden');
        save(); render();
    }
};

render();