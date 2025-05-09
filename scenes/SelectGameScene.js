class SelectGameScene extends Phaser.Scene {
    constructor() {
        super({
            key: 'SelectGameScene'
        });
    }

    preload() {
        // Load images for the options
        this.load.image('select-mine-background', 'assets/images/select-mine-background.png');
        this.load.image('free-mine', 'assets/images/free-mine.png');
        this.load.image('rented-mine', 'assets/images/rented-mine.png');
    }

    create() {
        this.cameras.main.fadeIn(500, 0, 0, 0);
        const gameWidth = this.scale.width;
        const gameHeight = this.scale.height;

        const bg = this.add.image(gameWidth / 2, gameHeight / 2, 'select-mine-background');
        this.scaleBackgroundToFill(bg, gameWidth, gameHeight);

        const optionSpacing = 500;
        const optionWidth = 200;
        const centerX = gameWidth / 2;
        const centerY = gameHeight / 2;

        const options = [
            { key: 'free-mine', label: 'Public Quarry', x: centerX - optionWidth - optionSpacing / 2 },
            { key: 'rented-mine', label: 'Contract Mine', x: centerX + optionWidth + optionSpacing / 2 }
        ];

        options.forEach(option => {
            // Lấy kích thước ảnh gốc
            const tex = this.textures.get(option.key).getSourceImage();
            const imgWidth = tex.width;
            const imgHeight = tex.height;
            const padding = 20;

            // Vẽ rectangle phía sau để làm viền
            const border = this.add.rectangle(
                option.x,
                centerY,
                imgWidth + padding * 2,
                imgHeight + padding * 2,
                0xffffff
            );
            border.setStrokeStyle(20, 0x7f4412); // Đường viền trắng
            border.setOrigin(0.5);


            // Thêm hình ảnh
            const image = this.add.image(option.x, centerY, option.key).setInteractive();

            // Thêm chữ bên dưới
            const label = this.add.text(option.x, centerY + imgHeight / 2 + 40, option.label, {
                fontFamily: 'MyFont',
                fontSize: '82px',
                stroke: '#671700',         // màu viền
                strokeThickness: 16,
                fill: '#ffffff'
            }).setOrigin(0.5);

            // Sự kiện click
            image.on('pointerdown', () => {
                if (option.key === 'free-mine') {
                    alert('This feature is not available yet');
                    return;
                } else {
                    this.cameras.main.fadeOut(200, 0, 0, 0);
                    this.cameras.main.once('camerafadeoutcomplete', () => {
                        this.scene.start('InputMineScene');
                    });
                }
            });
        });
    }


    scaleBackgroundToFill(image, targetWidth, targetHeight) {
        const imgWidth = image.width;
        const scale = targetWidth / imgWidth;
        image.setScale(scale);
        image.setPosition(targetWidth / 2, targetHeight / 2);
    }
}
