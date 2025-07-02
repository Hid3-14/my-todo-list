document.addEventListener('DOMContentLoaded', () => {
    // HTML要素を取得
    const todoInput = document.getElementById('todo-input');
    const addTodoBtn = document.getElementById('add-todo-btn');
    const todoList = document.getElementById('todo-list');

    // TODO追加ボタンがクリックされた時の処理
    addTodoBtn.addEventListener('click', addTodo);

    // Enterキーが押された時の処理（入力フィールドで）
    todoInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            addTodo();
        }
    });

    // --- 新しく追加・修正する部分ここから ---

    // ページ読み込み時に保存されたTODOを読み込む
    loadTodos();

    /**
     * 新しいTODO項目を追加する関数
     */
    function addTodo() {
        const todoText = todoInput.value.trim();

        if (todoText === '') {
            alert('TODOを入力してください！');
            return;
        }

        // 新しいTODO項目を作成し、リストに追加
        createTodoItem(todoText, false); // falseは未完了を意味する

        // 入力フィールドをクリア
        todoInput.value = '';

        // TODOリストが変更されたので保存
        saveTodos();
    }

    /**
     * TODO項目をDOMに作成し、追加するヘルパー関数
     * @param {string} text - TODOのテキスト
     * @param {boolean} completed - 完了状態かどうか (true: 完了, false: 未完了)
     */
    function createTodoItem(text, completed) {
        const listItem = document.createElement('li');
        listItem.classList.add('todo-item');
        if (completed) {
            listItem.classList.add('completed');
        }

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = completed; // 初期状態を設定
        checkbox.addEventListener('change', toggleComplete);

        const todoSpan = document.createElement('span');
        todoSpan.textContent = text;

        const actionsDiv = document.createElement('div');
        actionsDiv.classList.add('actions');
        // 削除ボタン
        const deleteButton = document.createElement('button');
        deleteButton.textContent = '削除';
        deleteButton.classList.add('delete-btn');
        deleteButton.addEventListener('click', deleteTodo);
        // 編集ボタン
        const editButton = document.createElement('button');
        editButton.textContent = '編集';
        editButton.classList.add('edit-btn');
        editButton.addEventListener('click', editTodo);

        // アクションボタンの追加順序を調整 (チェックボックス、編集、削除)
        actionsDiv.appendChild(checkbox);
        actionsDiv.appendChild(editButton);
        actionsDiv.appendChild(deleteButton);

        // 各TODO項目に紐付ける情報を保持
        // editButton.dataset.todoId = uniqueId; // 必要であればユニークIDなど

        listItem.appendChild(todoSpan);
        listItem.appendChild(actionsDiv);

        todoList.appendChild(listItem);
    }
    /**
     * TODOを編集モードに切り替える関数
     * @param {Event} event - 編集ボタンのclickイベントオブジェクト
     */
    function editTodo(event) {
        const listItem = event.target.closest('.todo-item');
        const todoSpan = listItem.querySelector('span');

        if (listItem.classList.contains('editing')) {
            return;
        }

        const currentText = todoSpan.textContent;

        const inputField = document.createElement('input');
        inputField.type = 'text';
        inputField.value = currentText;
        inputField.classList.add('edit-input');

        todoSpan.replaceWith(inputField);

        listItem.classList.add('editing');
        inputField.focus();

        inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                confirmEdit(inputField, listItem);
            }
        });
        inputField.addEventListener('blur', () => {
            confirmEdit(inputField, listItem);
        });
    }

    /**
     * TODOの編集を確定する関数
     * @param {HTMLElement} inputField - 編集中のinput要素
     * @param {HTMLElement} listItem - 編集対象のli要素
     * @param {boolean} isEnterKey - Enterキーで確定されたか
     */
    function confirmEdit(inputField, listItem) {
        // **重要** フォーカスが外れたときに複数回呼ばれるのを防ぐためのガード
        // すでにlistItemがeditingクラスを持っていない場合（編集が完了している場合）は処理を中断
        if (!listItem.classList.contains('editing')) {
            return;
        }

        const newText = inputField.value.trim();

        const originalText = listItem.querySelector('span') ? listItem.querySelector('span').textContent : '';


        const newSpan = document.createElement('span');
        newSpan.textContent = newText === '' ? originalText : newText;

        inputField.replaceWith(newSpan);

        listItem.classList.remove('editing');

        saveTodos();
    }

    /**
     * TODOの完了/未完了を切り替える関数
     * @param {Event} event - チェックボックスのchangeイベントオブジェクト
     */
    function toggleComplete(event) {
        const listItem = event.target.closest('.todo-item');
        listItem.classList.toggle('completed');
        // TODOリストが変更されたので保存
        saveTodos();
    }

    /**
     * TODO項目を削除する関数
     * @param {Event} event - 削除ボタンのclickイベントオブジェクト
     */
    function deleteTodo(event) {
        const listItem = event.target.closest('.todo-item');
        listItem.remove();
        // TODOリストが変更されたので保存
        saveTodos();
    }

    /**
     * 現在のTODOリストの内容をlocalStorageに保存する関数
     */
    function saveTodos() {
        const todos = [];
        // todoListのすべての子要素（li.todo-item）をループ
        todoList.querySelectorAll('.todo-item').forEach(item => {
            const text = item.querySelector('span').textContent; // TODOテキスト
            const completed = item.classList.contains('completed'); // 完了状態

            todos.push({ text: text, completed: completed });
        });

        // 配列をJSON文字列に変換してlocalStorageに保存
        // 'todos' はlocalStorageに保存するデータのキー名
        localStorage.setItem('todos', JSON.stringify(todos));
        console.log('TODOを保存しました！'); // 確認用
    }

    /**
     * localStorageからTODOリストの内容を読み込み、ページに表示する関数
     */
    function loadTodos() {
        // 'todos' キーで保存されたJSON文字列を取得
        const storedTodos = localStorage.getItem('todos');

        if (storedTodos) {
            // JSON文字列をJavaScriptのオブジェクトに変換
            const todos = JSON.parse(storedTodos);

            // 読み込んだTODO項目をページに追加
            todos.forEach(todo => {
                createTodoItem(todo.text, todo.completed);
            });
            console.log('TODOを読み込みました！'); // 確認用
        } else {
            console.log('保存されたTODOはありません。'); // 確認用
        }
    }

    // --- 新しく追加・修正する部分ここまで ---
});