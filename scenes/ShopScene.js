class ShopScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ShopScene' });
    }

    preload() {
        // Load shop assets
        this.load.image('item-bg', 'https://via.placeholder.com/200x250/333333/444444?text=Item');
        this.load.image('rope', 'https://cdn.pixabay.com/photo/2016/03/31/19/25/rope-1295003_1280.png');
        this.load.image('hooks', 'https://cdn.pixabay.com/photo/2016/03/31/19/23/clothes-1294962_1280.png');
        this.load.image('boom', 'https://cdn.pixabay.com/photo/2013/07/13/10/24/bomb-157150_1280.png');
        this.load.image('back-button', 'https://via.placeholder.com/150x50/444444/ffffff?text=Back+to+Game');
    }

    create() {
        // Get game dimensions
        this.gameWidth = this.scale.width;
        this.gameHeight = this.scale.height;
        
        // Create shop background
        this.background = this.add.rectangle(this.gameWidth/2, this.gameHeight/2, this.gameWidth, this.gameHeight, 0x222222);
        
        // Shop title
        this.shopTitle = this.add.text(this.gameWidth/2, 80, 'Shop', {
            font: '48px Arial',
            fill: '#ffd700'
        }).setOrigin(0.5);
        
        // Display current gold
        this.goldText = this.add.text(this.gameWidth/2, 130, 'Gold: ' + gameState.score, {
            font: '24px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // Create shop items - position based on screen width
        const itemSpacing = this.gameWidth / 4;
        this.createShopItem(itemSpacing, this.gameHeight/2, 'Better Rope', 'Pull gold faster', 50, 'ropeSpeed', 2, 'rope');
        this.createShopItem(itemSpacing * 2, this.gameHeight/2, 'Stronger Hook', 'Carry more gold', 100, 'hookStrength', 2, 'hooks');
        this.createShopItem(itemSpacing * 3, this.gameHeight/2, 'Dynamite', 'Break rocks', 200, 'hasDynamite', true, 'boom');
        
        // Back button
        this.backButton = this.add.image(this.gameWidth/2, this.gameHeight - 100, 'back-button').setInteractive();
        this.backButton.on('pointerdown', () => {
            this.scene.resume('GameScene');
            this.scene.stop();
        });
        
        // Add resize listener
        this.scale.on('resize', this.resize, this);
    }
    
    resize(gameSize) {
        // Update game dimensions
        this.gameWidth = gameSize.width;
        this.gameHeight = gameSize.height;
        
        // Update background
        this.background.setSize(this.gameWidth, this.gameHeight);
        this.background.setPosition(this.gameWidth/2, this.gameHeight/2);
        
        // Update UI positions
        this.shopTitle.setPosition(this.gameWidth/2, 80);
        this.goldText.setPosition(this.gameWidth/2, 130);
        this.backButton.setPosition(this.gameWidth/2, this.gameHeight - 100);
        
        // Reposition shop items
        const itemSpacing = this.gameWidth / 4;
        // We'll need to destroy and recreate the shop items if they're repositioned
        // For simplicity in this update, we'll just relaunch the scene when resized
        this.scene.restart();
    }
    
    createShopItem(x, y, name, description, price, upgradeKey, upgradeValue, image) {
        // Item background
        const itemBg = this.add.image(x, y, image);
        itemBg.setDisplaySize(50, 70);
        // Item name
        this.add.text(x, y - 80, name, {
            font: '20px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);
        
        // Item description
        this.add.text(x, y - 50, description, {
            font: '16px Arial',
            fill: '#aaaaaa'
        }).setOrigin(0.5);
        
        // Item price
        this.add.text(x, y + 50, price + ' Gold', {
            font: '18px Arial',
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
            this.add.text(x, y + 100, 'Purchased', {
                font: '18px Arial',
                fill: '#00ff00'
            }).setOrigin(0.5);
        } else {
            const buyButton = this.add.text(x, y + 100, 'Buy', {
                font: '18px Arial',
                fill: '#ffffff',
                backgroundColor: '#ffd700',
                padding: { x: 15, y: 8 }
            }).setOrigin(0.5).setInteractive();
            
            buyButton.on('pointerdown', () => {
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
                    
                    // Replace button with Purchased text
                    buyButton.setVisible(false);
                    this.add.text(x, y + 50, 'Purchased', {
                        font: '18px Arial',
                        fill: '#00ff00'
                    }).setOrigin(0.5);
                } else {
                    // Not enough gold - flash the gold text red
                    this.goldText.setFill('#ff0000');
                    this.time.delayedCall(500, () => {
                        this.goldText.setFill('#ffffff');
                    });
                }
            });
            
            // Hover effect
            buyButton.on('pointerover', () => {
                buyButton.setBackgroundColor('#b8860b');
            });
            
            buyButton.on('pointerout', () => {
                buyButton.setBackgroundColor('#ffd700');
            });
        }
    }
} 