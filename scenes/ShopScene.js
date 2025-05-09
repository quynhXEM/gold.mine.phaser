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



        // Create shop items - position based on screen width
        const itemSpacing = this.gameWidth / 9;
        this.createShopItem(itemSpacing, this.gameHeight/2 + 250, 'Better Rope', 'Pull gold faster', 50, 'ropeSpeed', 2, 'lucky');
        this.createShopItem(itemSpacing * 2, this.gameHeight/2 + 250, 'Stronger Hook', 'Carry more gold', 100, 'hookStrength', 2, 'book');
        this.createShopItem(itemSpacing * 3, this.gameHeight / 2 + 250, 'Dynamite', 'Break rocks', 200, 'hasDynamite', true, 'dynamite');
        this.createShopItem(itemSpacing * 4, this.gameHeight / 2 + 250, 'Dynamite', 'Break rocks', 200, 'hasDynamite', true, 'polish');

    }

    createShopItem(x, y, name, description, price, upgradeKey, upgradeValue, image) {
        // Item background
        const itemBg = this.add.image(x, y, image);
        itemBg.setDisplaySize(150, 220);
        // Item price
        this.add.text(x, y + 150, price + 'g', {
            fontSize: '58px',
            fontFamily: 'MyFont',
            fill: '#ffd700'
        }).setOrigin(0.5);

        // Check if already purchased
        let purchased = false;
        if (upgradeKey === 'hasDynamite') {

        } else {
            purchased = gameState.upgrades[upgradeKey] >= upgradeValue;
        }

        // Buy button or Purchased text
        if (purchased) {

        } else {
            itemBg.on('pointerdown', () => {
                if (gameState.score >= price) {
                    // Subtract gold
                    gameState.score -= price;

                    // Apply upgrade
                    if (upgradeKey === 'hasDynamite') {
                        gameState.upgrades.hasDynamite = gameState.upgrades.hasDynamite + 1;
                    } else {
                        gameState.upgrades[upgradeKey] = upgradeValue;
                    }

                    // Update gold display
                    this.goldText.setText('Gold: ' + gameState.score);

                } else {
                    // Not enough gold - flash the gold text red
                    this.goldText.setFill('#ff0000');
                    this.time.delayedCall(500, () => {
                        this.goldText.setFill('#ffffff');
                    });
                }
            });
        }
    }


    // Scale background to fill
    scaleBackgroundToFill(image, targetWidth, targetHeight) {
        const imgWidth = image.width;
        const scale = targetWidth / imgWidth;
        image.setScale(scale);
        image.setPosition(targetWidth / 2, targetHeight / 2);
    }
} 