class StartScene extends Phaser.Scene {
    constructor() {
        super({ key: 'StartScene' });
        // Base screen size for scaling calculations
        this.baseWidth = 1920;
        this.baseHeight = 1080;

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

        // Calculate scale factor based on screen width
        const scaleFactor = this.calculateScaleFactor();

        // Add game title with dynamic font size
        this.gameTitle = this.add.text(this.gameWidth / 2, this.gameHeight / 3, 'GOLD MINER GAME', {
            font: `${Math.round(64 * scaleFactor)}px Nashville`,
            fill: '#ffd700',
            align: 'center',
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000',
                blur: 2,
                stroke: true,
                fill: true
            }
        }).setOrigin(0.5);

        // Add start button
        this.startButton = this.add.image(this.gameWidth / 2, this.gameHeight / 1.8, 'start-button').setInteractive();

        // Scale button with constraints
        const buttonSize = this.calculateButtonSize(scaleFactor);
        this.startButton.setDisplaySize(buttonSize.width, buttonSize.height);

        // Add hover effect
        this.startButton.on('pointerover', () => {
            this.startButton.setScale(this.startButton.scaleX * 1.1, this.startButton.scaleY * 1.1);
        });

        this.startButton.on('pointerout', () => {
            this.startButton.setDisplaySize(buttonSize.width, buttonSize.height);
        });

        // Add click event to transition to game scene
        this.startButton.on('pointerdown', () => {
            this.scene.start('GameScene');
        });

        // Add resize listener
        this.scale.on('resize', this.resize, this);
    }

    // Calculate button size with constraints
    calculateButtonSize(scaleFactor) {
        // Calculate proportional width
        let width = 200 * scaleFactor;

        // Apply constraints
        width = Math.max(this.minButtonWidth, Math.min(this.maxButtonWidth, width));

        // Calculate height based on width to maintain aspect ratio
        const height = width / this.buttonRatio;

        return { width, height };
    }

    // Calculate scale factor based on screen size
    calculateScaleFactor() {
        // Calculate based on width or height, whichever is smaller
        const widthRatio = this.gameWidth / (this.baseWidth - 200);
        return Math.min(widthRatio);
    }

    // Scale background to fill screen while maintaining aspect ratio
    scaleBackgroundToFill(image, targetWidth, targetHeight) {
        // Get the image's original dimensions
        const imgWidth = image.width;
        const imgHeight = image.height;

        // Calculate scale ratios
        const scaleX = targetWidth / imgWidth;
        const scaleY = targetHeight / imgHeight;

        // Use the larger scale to ensure the image covers the entire screen
        const scale = Math.max(scaleX, scaleY);

        // Apply the scale
        image.setScale(scale);

        // Center the image
        image.setPosition(targetWidth / 2, targetHeight / 2);
    }

    resize(gameSize) {
        // Update game dimensions
        this.gameWidth = gameSize.width;
        this.gameHeight = gameSize.height;

        // Update background to fit new dimensions while maintaining aspect ratio
        this.scaleBackgroundToFill(this.bg, this.gameWidth, this.gameHeight);

        // Calculate new scale factor
        const scaleFactor = this.calculateScaleFactor();

        // Update font size
        this.gameTitle.setPosition(this.gameWidth / 2, this.gameHeight / 3);
        this.gameTitle.setFontSize(Math.round(64 * scaleFactor));

        // Update button size and position with constraints
        const buttonSize = this.calculateButtonSize(scaleFactor);
        this.startButton.setPosition(this.gameWidth / 2, this.gameHeight / 1.8);
        this.startButton.setDisplaySize(buttonSize.width, buttonSize.height);
    }
}