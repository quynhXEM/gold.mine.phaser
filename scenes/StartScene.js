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
        this.load.image('background', 'assets/images/background.jpg');
        this.load.image('start-button', 'assets/images/play-btn.png');
    }

    create() {
        // Get game dimensions
        this.gameWidth = this.scale.width;
        this.gameHeight = this.scale.height;

        // Add fullscreen background image
        this.bg = this.add.image(this.gameWidth / 2, this.gameHeight / 2, 'background');
        this.scaleBackgroundToFill(this.bg, this.gameWidth, this.gameHeight);

        // Make the background interactive
        this.bg.setInteractive();

        // Add resize listener
        this.scale.on('resize', this.resize, this);

        // Thêm dòng chữ "Tap to Start" ở giữa màn hình
        this.tapText = this.add.text(this.gameWidth / 2, this.gameHeight / 2, 'Tap to Start', {
            fontFamily: 'MyFont',
            fontSize: '144px',
            stroke: '#671700',         // màu viền
            strokeThickness: 16,
            fill: '#f8e600'
        }).setOrigin(0.5);

        // Tạo hiệu ứng nhấp nháy bằng tween
        this.tweens.add({
            targets: this.tapText,
            alpha: { from: 1, to: 0 },
            duration: 1000,
            yoyo: true,
            repeat: -1
        });

        // Add click event to start the game
        this.bg.on('pointerdown', () => {
            this.scene.start('SelectGameScene');
        });
    }

    // Calculate scale factor based on screen size
    calculateScaleFactor() {
        // Calculate based on width or height, whichever is smaller
        const widthRatio = this.gameWidth / (this.baseWidth - 200);
        return Math.min(widthRatio);
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


    resize(gameSize) {
        // Update game dimensions
        this.gameWidth = gameSize.width;
        this.gameHeight = gameSize.height;

        // Update background to fit new dimensions while maintaining aspect ratio
        this.scaleBackgroundToFill(this.bg, this.gameWidth, this.gameHeight);
        this.tapText.setPosition(this.gameWidth / 2, this.gameHeight / 2);

    }
}