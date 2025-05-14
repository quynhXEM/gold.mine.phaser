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
            debug: true // Không hiển thị debug
        }
    },
    parent: 'game-container',
    dom: {
        createContainer: true
    },
    scene: [
        // StartScene,
        // AuthScene,
        // SelectGameScene,
        // InputMineScene,
        RentedMineGameScene,
        ShopScene
    ] // Các scene sẽ được hiển thị trong game
};

// Global game state that persists between scenes
const gameState = {
    gold: 1000, // Điểm số của người chơi
    upgrades: {
        ropeSpeed: 1, // Tốc độ kéo dây
        hookStrength: 1, // Độ mạnh của hook
        hasDynamite: 1 // Có hay không pháo hoa
    }
};

// Create the game
const game = new Phaser.Game(config); 