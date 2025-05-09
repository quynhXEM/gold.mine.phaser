class InputMineScene extends Phaser.Scene {
    constructor() {
        super({
            key: 'InputMineScene'
        });
    }

    preload() {
        // Load images for the options
        this.load.image('board-form', 'assets/images/board-form.png');
        this.load.image('confirm-btn', 'assets/images/confirm-btn.png');
        this.load.image('select-mine-background', 'assets/images/select-mine-background.png');
    }

    create() {
        this.cameras.main.fadeIn(300, 0, 0, 0);
        const gameWidth = this.scale.width;
        const gameHeight = this.scale.height;

        const bg = this.add.image(gameWidth / 2, gameHeight / 2, 'select-mine-background');
        this.scaleBackgroundToFill(bg, gameWidth, gameHeight);

        const boardForm = this.add.image(gameWidth / 2, gameHeight / 2 + 400, 'board-form')
            .setScale(1.95)

        const formContainer = this.add.container(gameWidth / 2, gameHeight / 2);

        // Create form elements
        const loginButton = this.add.text(0, 220, 'Enter Mine ID', {
            fontFamily: 'MyFont',
            fontSize: '70px',
            fill: "#fcee09",
            stroke: '#671700',
            strokeThickness: 10,
        }).setOrigin(0.5, 0.5)
            .setInteractive();

        // // Create login form
        const mineID = this.add.dom(625, 320).createFromHTML('<input value="1" class="w-[500px] h-[50px] rounded-full bg-white text-4xl text-center" type="text" name="mine-id" placeholder="Mine ID">')
            .setOrigin(1.75, 0.5)
        const loginSubmit = this.add.image(0, 450, 'confirm-btn',)
            .setOrigin(0.5, 0.5)
            .setScale(0.5)
            .setInteractive();

        formContainer.add([loginButton, mineID, loginSubmit]);


        // // Add interactivity to submit buttons
        loginSubmit.on('pointerdown', () => {
            const mine_id = mineID.getChildByName('mine-id').value;

            if (!mine_id) {
                alert('Please enter Mine ID');
                return;
            }
            if (mine_id === '1') {
                formContainer.setVisible(false);
                this.cameras.main.fadeOut(300, 0, 0, 0);
                this.cameras.main.once('camerafadeoutcomplete', () => {
                    this.scene.start('RentedMineGameScene');
                });
            } else {
                alert('Mine ID is not found, please try again');
            }
        });

    }


    scaleBackgroundToFill(image, targetWidth, targetHeight) {
        const imgWidth = image.width;
        const scale = targetWidth / imgWidth;
        image.setScale(scale);
        image.setPosition(targetWidth / 2, targetHeight / 2);
    }
}


