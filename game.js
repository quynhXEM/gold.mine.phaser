// Game configuration
const config = {
    type: Phaser.AUTO,
    width: 2277,           // base width
    height: 1280,           // base height (16:9)
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 2277,
        height: 1280,
    },
    physics: {
        default: 'arcade', // Sử dụng phương thức vật lý arcade
        arcade: {
            gravity: { y: 0 }, // Không có trọng lực
            debug: false // Không hiển thị debug
        }
    },
    parent: 'game-container',
    dom: {
        createContainer: true
    },
    scene: [
        StartScene,
        AuthScene,
        SelectGameScene,
        InputMineScene,
        RentedMineGameScene,
        ShopScene
    ], // Các scene sẽ được hiển thị trong game
};

// Global game state that persists between scenes
const gameState = {
    gold: 1000,
    user: {},
    upgrades: {
        ropeSpeed: 1, // Tốc độ kéo dây
        lucky: 0,
        book: 0,
        polish: 0,
        dynamite: 0,
    }
};

// Create the game
const game = new Phaser.Game(config); 