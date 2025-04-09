// Game configuration
const config = {
    type: Phaser.AUTO, // Tự động chọn phương thức render
    scale: {
        mode: Phaser.Scale.RESIZE, // Thay đổi kích thước theo kích thước của phần tử game-container
        parent: 'game-container', // Gắn vào phần tử có id game-container
        width: '100%', // Kích thước 100% của phần tử cha
        height: '100%' // Kích thước 100% của phần tử cha
    },
    physics: {
        default: 'arcade', // Sử dụng phương thức vật lý arcade
        arcade: {
            gravity: { y: 0 }, // Không có trọng lực
            debug: false // Không hiển thị debug
        }
    },
    scene: [StartScene, GameScene, ShopScene] // Các scene sẽ được hiển thị trong game
};

// Global game state that persists between scenes
const gameState = {
    score: 1000, // Điểm số của người chơi
    upgrades: {
        ropeSpeed: 1, // Tốc độ kéo dây
        hookStrength: 1, // Độ mạnh của hook
        hasDynamite: 1 // Có hay không pháo hoa
    }
};

// Create the game
const game = new Phaser.Game(config); 