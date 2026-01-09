let dailyTasks = JSON.parse(localStorage.getItem('dailyTasks')) || [
    { id: 1, name: 'Workout', alternatives: ['Gym', 'Yoga'], completed: false, streak: 0 },
    { id: 2, name: 'Read', alternatives: ['Book', 'Kindle'], completed: false, streak: 0 }
];

let weeklyTasks = JSON.parse(localStorage.getItem('weeklyTasks')) || [
    { id: 101, name: 'Go out', alternatives: ['Dinner', 'Movie'], completed: false }
];

function save() {
    localStorage.setItem('dailyTasks', JSON.stringify(dailyTasks));
    localStorage.setItem('weeklyTasks', JSON.stringify(weeklyTasks));
}

function render() {
    renderList('dailyTasksList', dailyTasks, true);
    renderList('weeklyTasksList', weeklyTasks, false);
}

function renderList(elementId, tasks, isDaily) {
    const list = document.getElementById(elementId);
    list.innerHTML = '';
    tasks.forEach((task, index) => {
        const card = document.createElement('div');
        card.className = `task-card ${task.completed ? 'completed' : ''}`;
        card.innerHTML = `
            <div class="task-main">
                <div class="move-controls">
                    <button class="move-btn" onclick="move(${task.id}, ${isDaily}, -1)" ${index === 0 ? 'disabled' : ''}>▲</button>
                    <button class="move-btn" onclick="move(${task.id}, ${isDaily}, 1)" ${index === tasks.length - 1 ? 'disabled' : ''}>▼</button>
                </div>
                <button class="check-btn ${task.completed ? 'checked' : ''}" onclick="toggle(${task.id}, ${isDaily})">
                    ${task.completed ? '✓' : '○'}
                </button>
                <span class="task-name">
                    ${task.name}
                    ${isDaily ? `<span class="streak-inline">(${task.streak} 🔥)</span>` : ''}
                </span>
                ${!isDaily ? `<span class="weekly-progress">${task.completed ? '✅ Done' : '⏳ Pending'}</span>` : ''}
                <button class="swap-btn" onclick="toggleAlts(${task.id}, ${isDaily})">↔️</button>
                <button class="delete-btn" onclick="remove(${task.id}, ${isDaily})">✕</button>
            </div>
            <div id="alts-${task.id}" class="alternatives hidden">
                <div class="alt-list">
                    <span>Swap with:</span>
                    ${task.alternatives.map(alt => `<button class="alt-btn" onclick="swap(${task.id}, ${isDaily}, '${alt}')">${alt}</button>`).join('')}
                </div>
                <div class="add-alt-form">
                    <input type="text" id="new-alt-input-${task.id}" placeholder="New alt...">
                    <button class="add-alt-btn" onclick="addAlternative(${task.id}, ${isDaily})">+</button>
                </div>
            </div>
        `;
        list.appendChild(card);
    });
}

window.toggle = (id, isDaily) => {
    let tasks = isDaily ? dailyTasks : weeklyTasks;
    let t = tasks.find(x => x.id === id);
    t.completed = !t.completed;
    if (isDaily) t.streak = t.completed ? t.streak + 1 : Math.max(0, t.streak - 1);
    save(); render();
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

window.addAlternative = (id, isDaily) => {
    const input = document.getElementById(`new-alt-input-${id}`);
    const newAlt = input.value.trim();
    if (newAlt) {
        let tasks = isDaily ? dailyTasks : weeklyTasks;
        let t = tasks.find(x => x.id === id);
        if (!t.alternatives.includes(newAlt) && t.name !== newAlt) {
            t.alternatives.push(newAlt);
            save(); render();
            // Re-open alts after render
            toggleAlts(id, isDaily);
        }
    }
};

document.getElementById('addDailyBtn').onclick = () => document.getElementById('dailyAddForm').classList.toggle('hidden');
document.getElementById('addWeeklyBtn').onclick = () => document.getElementById('weeklyAddForm').classList.toggle('hidden');

document.getElementById('saveDailyBtn').onclick = () => {
    const name = document.getElementById('dailyTaskName').value;
    const alts = document.getElementById('dailyTaskAlts').value.split(',').map(x => x.trim()).filter(x => x);
    if (name) {
        dailyTasks.push({ id: Date.now(), name, alternatives: alts, completed: false, streak: 0 });
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
        weeklyTasks.push({ id: Date.now(), name, alternatives: alts, completed: false });
        document.getElementById('weeklyTaskName').value = '';
        document.getElementById('weeklyTaskAlts').value = '';
        document.getElementById('weeklyAddForm').classList.add('hidden');
        save(); render();
    }
};

render();