class AuthScene extends Phaser.Scene {
    constructor() {
        super({
            key: 'AuthScene'
        });
    }

    preload() {
        // Load any assets if needed
        this.load.image('board-form', 'assets/images/board-form.png');
        this.load.image('login-btn', 'assets/images/login-btn.png');
    }

    create() {

        const user = sessionStorage.getItem('user');
        if (user) {
            this.scene.start('SelectGameScene');
        }

        this.cameras.main.fadeIn(500, 0, 0, 0);
        // Get game dimensions
        const gameWidth = this.scale.width;
        const gameHeight = this.scale.height;

        const bg = this.add.image(gameWidth / 2, gameHeight / 2, 'background').setTint(0xb5b5b5);

        // Create a container for the form


        const boardForm = this.add.image(gameWidth / 2, gameHeight / 2 + 400, 'board-form')
            .setScale(1.95)

        const formContainer = this.add.container(gameWidth / 2, gameHeight / 2);

        // Create form elements
        const loginButton = this.add.text(0, 220, 'uGOLD Welcome', {
            fontFamily: 'MyFont',
            fontSize: '70px',
            fill: "#fcee09",
            stroke: '#671700',
            strokeThickness: 10,
        }).setOrigin(0.5, 0.5)
            .setInteractive();

        // // Create login form
        const usernameInput = this.add.dom(0, 300).createFromHTML('<input value="admin" class="w-[500px] h-[50px] rounded-full bg-white text-4xl pl-8" type="text" name="username" placeholder="Username">')
            .setOrigin(1.75, 0.5);
        const passwordInput = this.add.dom(0, 370).createFromHTML('<input value="123" class="w-[500px] h-[50px] rounded-full bg-white text-4xl pl-8" type="password" name="password" placeholder="Password">')
            .setOrigin(1.75, 0.5);
        const loginSubmit = this.add.image(0, 470, 'login-btn',)
            .setOrigin(0.5, 0.5)
            .setScale(0.5)
            .setInteractive();

        formContainer.add([loginButton, usernameInput, passwordInput, loginSubmit]);


        // // Add interactivity to submit buttons
        loginSubmit.on('pointerdown', () => {
            const username = usernameInput.getChildByName('username').value;
            const password = passwordInput.getChildByName('password').value;
            if (username === '' || password === '') {
                alert('Please enter username and password');
                return;
            }
            if (username === 'admin' && password === '123') {
                sessionStorage.setItem('user', username);
                this.scene.start('SelectGameScene');
            } else {
                alert('Username or password is incorrect');
            }
        });
    }
}
