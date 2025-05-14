class ShopScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ShopScene' });
    }

    preload() {
        // Load shop assets
        this.load.image('shop-background', 'assets/images/shop-background.png');
        this.load.image('back', 'assets/images/back.png');
        this.load.image('dynamite', 'assets/images/dynamite.png');
        this.load.image('polish', 'assets/images/polish.png');
        this.load.image('lucky', 'assets/images/lucky.png');
        this.load.image('book', 'assets/images/book.png');
    }

    create() {
        // Get game dimensions
        this.gameWidth = this.scale.width;
        this.gameHeight = this.scale.height;
        this.description = 'Buy items to upgrade your mining skills';
        // Create shop background
        const background = this.add.image(this.gameWidth / 2, this.gameHeight / 2, 'shop-background');
        this.scaleBackgroundToFill(background, this.gameWidth, this.gameHeight);

        // Back
        const backButton = this.add.image(20, 20, `back`)
            .setScale(0.09, 0.1)
            .setOrigin(0, 0)
            .setInteractive()
            .setPosition(10, 0);


        backButton.on('pointerdown', () => {
            this.scene.stop();
            this.scene.resume('RentedMineGameScene');
        });

        // Shop title
        this.shopTitle = this.add.text(this.gameWidth / 2, 80, 'uGOLD SHOP', {
            fontFamily: 'MyFont',
            fontSize: '118px',
            fill: '#ffd700',
            stroke: '#000000',
            strokeThickness: 16
        }).setOrigin(0.5);

        const descriptionText = this.add.text(300, 400, this.description, {
            fontSize: '38px',
            fontFamily: 'MyFont',
            fill: '#000000'
        })

        // Create shop items - position based on screen width
        const itemSpacing = this.gameWidth / 9;
        this.createShopItem(itemSpacing, this.gameHeight / 2 + 250, 'Better Rope', 'Increase gold spawn rate', 50, 'lucky', 2, 'lucky', descriptionText);
        this.createShopItem(itemSpacing * 2, this.gameHeight / 2 + 250, 'Rock Book', 'Increase the value of rock ores', 100, 'book', 2, 'book', descriptionText);
        this.createShopItem(itemSpacing * 3, this.gameHeight / 2 + 250, 'Dynamite', 'Destroy the block when dragging the wrong one', 200, 'dynamite', true, 'dynamite', descriptionText);
        this.createShopItem(itemSpacing * 4, this.gameHeight / 2 + 250, 'Polish', 'Increase the value of gold ores', 200, 'polish', true, 'polish', descriptionText);  
    }

    createShopItem(x, y, name, description, price, upgradeKey, upgradeValue, image, descriptionText) {
        // Item background
        const itemBg = this.add.image(x, y, image);
        itemBg.setDisplaySize(150, 220).setInteractive();
        // Item price
        this.add.text(x, y + 150, price + 'g', {
            fontSize: '58px',
            fontFamily: 'MyFont',
            fill: '#ffd700'
        }).setOrigin(0.5);

        // Buy button or Purchased text
        itemBg.on('pointerover', () => {
            descriptionText.setText(description)
        });

        itemBg.on('pointerdown', () => {
            if (gameState.gold >= price) {
                gameState.gold -= price;
                gameState.upgrades[upgradeKey] += 1;
            }
            console.log(gameState);
        });
    }


    // Scale background to fill
    scaleBackgroundToFill(image, targetWidth, targetHeight) {
        const imgWidth = image.width;
        const scale = targetWidth / imgWidth;
        image.setScale(scale);
        image.setPosition(targetWidth / 2, targetHeight / 2);
    }
} 