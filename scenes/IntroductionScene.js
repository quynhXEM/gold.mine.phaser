class IntroductionScene extends Phaser.Scene {
    constructor() {
        super({ key: 'IntroductionScene' });
    }

    preload() {
        this.load.image('introduction', 'assets/images/introduction.png');
        this.load.image('introduction_btn', 'assets/images/introduction_btn.png');
        this.load.image('homepage_btn', 'assets/images/homepage_btn.png');
    }

    create() {
        // Get game dimensions
        this.gameWidth = this.scale.width;
        this.gameHeight = this.scale.height;

        // Add fullscreen background image
        this.bg = this.add.image(this.gameWidth / 2, this.gameHeight / 2, 'introduction');
        this.scaleBackgroundToFill(this.bg, this.gameWidth, this.gameHeight);

        this.introduction_btn = this.add.image(0,0, 'introduction_btn')
        .setScale(0.25)
        .setPosition(450,  this.gameHeight - 100)
        .setInteractive()

        this.introduction_btn.on('pointerdown', () => {
            this.scene.pause();
            this.scene.start('StartScene');
        })

    }

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