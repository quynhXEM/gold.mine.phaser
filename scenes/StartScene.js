class StartScene extends Phaser.Scene {
    constructor() {
        super({ key: 'StartScene' });
        // Base screen size for scaling calculations
        this.baseWidth = 2277;
        this.baseHeight = 1280;

        // Button size constraints
        this.minButtonWidth = 100;
        this.maxButtonWidth = 400;
        this.buttonRatio = 2.5; // width:height ratio
    }

    preload() {
        // Load assets for the start screen
        this.load.image('background', 'assets/images/start_bg.jpg');
        this.load.image('start-button', 'assets/images/play-btn.png');
        this.load.image('full_btn', 'assets/images/full_screen.png');
    }

    create() {
        // Get game dimensions
        this.gameWidth = this.scale.width;
        this.gameHeight = this.scale.height;

        // Add fullscreen background image
        this.bg = this.add.image(this.gameWidth / 2, this.gameHeight / 2, 'background');
        this.scaleBackgroundToFill(this.bg, this.gameWidth, this.gameHeight);

        // Make the background interactive
        const enterFullBtn = this.add.image(this.gameWidth - 100, 100, 'full_btn')
        .setScale(0.2)
        .setInteractive()
        .on('pointerup', () => {
            if (!this.scale.isFullscreen) {
                this.scale.startFullscreen();
            } else {
                this.scale.stopFullscreen();
            }
        });
        // Thêm dòng chữ "Tap to Start" ở giữa màn hình
        this.tapText = this.add.text(820, 550, 'START', {
            fontFamily: 'MyFont',
            fontSize: '100px',
            stroke: '#671700',         // màu viền
            strokeThickness: 16,
            fill: '#ffffff'
        }).setOrigin(0.5)
        .setPosition(820, 560)
        this.tapText.setInteractive();


        this.up = this.add.text(820, 550, '⬇️ Drop Claw', {
            fontFamily: 'MyFont',
            fontSize: '60px',
            stroke: '#671700',         // màu viền
            strokeThickness: 16,
            fill: '#ffffff'
        }).setOrigin(0.5)
        .setPosition(350, this.gameHeight - 70)

        this.down = this.add.text(820, 550, '⬆️ Toss Dynamite', {
            fontFamily: 'MyFont',
            fontSize: '60px',
            stroke: '#671700',         // màu viền
            strokeThickness: 16,
            fill: '#ffffff'
        }).setOrigin(0.5)
        .setPosition(850, this.gameHeight - 70)

        // Tạo hiệu ứng nhấp nháy bằng tween
        this.tweens.add({
            targets: this.tapText,
            alpha: { from: 1, to: 0 },
            duration: 1000,
            yoyo: true,
            repeat: -1
        });

        // Add click event to start the game
        this.tapText.on('pointerdown', () => {
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('AuthScene');
            });
        });
    }

    // Scale background to fill screen while maintaining aspect ratio
    scaleBackgroundToFill(image, targetWidth, targetHeight) {
        // Lấy kích thước gốc của ảnh
        const imgWidth = image.width;

        // Tính tỉ lệ scale theo chiều ngang
        const scale = targetWidth / imgWidth;

        // Áp dụng scale giữ nguyên tỉ lệ gốc của ảnh
        image.setScale(scale);

        // Đặt lại vị trí để ảnh được căn giữa theo chiều dọc
        image.setPosition(targetWidth / 2, targetHeight / 2);
    }
}