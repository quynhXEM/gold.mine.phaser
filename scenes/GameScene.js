class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        // Thời gian chơi game (giây)
        this.gameTime = 10;
        // Trạng thái hook đang mở rộng
        this.hookExtending = false;
        // Trạng thái hook đang thu hồi
        this.hookRetracting = false;
        // Độ dài hiện tại của hook
        this.hookLength = 0;
        // Độ dài tối đa của hook (chỉ dùng để tham chiếu)
        this.maxHookLength = 450;
        // Vật phẩm đang được hook móc
        this.hookedItem = null;
        this.gameOver = false;

        // Các tham số cho chuyển động lắc lư
        this.swingAngle = 0; // Góc lắc hiện tại
        this.swingDirection = 1; // Hướng lắc (1: phải, -1: trái)
        this.swingSpeed = 0.01; // Tốc độ lắc
        this.maxSwingAngle = Math.PI / 2; // Góc lắc tối đa (90 độ)

        // Tham số quay của hook
        this.hookAngle = 0; // Góc quay hiện tại của hook so với dây
    }

    preload() {
        // Tải hình ảnh cho game
        this.load.image('backgrounds', 'assets/images/backgrounds.png');
        this.load.image('miner', 'assets/images/user.png');
        this.load.image('hook', 'assets/images/pickaxe.png');
        this.load.image('gold-small', 'assets/images/gold.png');
        this.load.image('gold-medium', 'assets/images/gold.png');
        this.load.image('gold-large', 'assets/images/gold.png');
        this.load.image('rock-small', 'https://png.pngtree.com/png-clipart/20231019/original/pngtree-close-up-of-big-stone-isolated-big-rock-png-image_13370758.png');
        this.load.image('rock-medium', 'https://png.pngtree.com/png-clipart/20240723/original/pngtree-nature-s-giants--big-rock-stone-illustrations-png-image_15618621.png');
        this.load.image('rock-large', 'https://png.pngtree.com/png-clipart/20240723/original/pngtree-nature-s-giants--big-rock-stone-illustrations-png-image_15618621.png');
        this.load.image('shop-button', 'https://cdn.pixabay.com/photo/2017/03/13/23/28/icon-2141484_1280.png');
        this.load.audio('boom', 'assets/sounds/boom.mp3');
        this.load.audio('mine', 'assets/sounds/mine.mp3');
        this.load.audio('collect', 'assets/sounds/collect.mp3');
    }

    create() {
        // Khởi tạo lại trạng thái game nếu cần
        this.gameOver = false;
        this.gameTime = 30;
        this.hookExtending = false;
        this.hookRetracting = false;
        this.hookLength = 0;
        this.hookedItem = null;
        this.swingAngle = 0;
        this.swingDirection = 1;

        // Lấy kích thước màn hình game
        this.gameWidth = this.scale.width;
        this.gameHeight = this.scale.height;

        // Tạo nền cho khu vực game
        this.background = this.add.image(this.gameWidth / 2, this.gameHeight / 2 + 100, 'backgrounds')
        .setDisplaySize(this.gameWidth, this.gameHeight)
        .setInteractive();

        // Tạo người thợ mỏ ở vị trí trên cùng giữa màn hình
        this.miner = this.add.image(this.gameWidth / 2, 100, 'miner');
        this.miner.setDisplaySize(100, 200);

        // Tạo hook và dây
        this.rope = this.add.graphics();
        this.hook = this.physics.add.image(this.gameWidth / 2, 50, 'hook');

        // Đặt điểm gốc quay của hook ở giữa để quay quanh tâm
        this.hook.setOrigin(0.5, 0.5);
        this.hook.setDisplaySize(40, 40);
        // Thiết lập ranh giới thế giới game
        this.physics.world.setBounds(0, 0, this.gameWidth, this.gameHeight);

        // Cấu hình hook để va chạm với ranh giới thế giới
        this.hook.setCollideWorldBounds(true);
        this.hook.body.onWorldBounds = true;

        // Lắng nghe sự kiện va chạm với ranh giới thế giới
        this.physics.world.on('worldbounds', function (body, up, down, left, right) {
            // Chỉ xử lý cho hook
            if (body.gameObject === this.hook) {
                this.onHitWorldBounds(up, down, left, right);
            }
        }, this);

        // Tạo vàng và đá
        this.treasures = this.physics.add.group();
        this.spawnTreasures();

        // Tạo các phần tử giao diện người dùng
        this.scoreText = this.add.text(20, 20, `Gold: ${gameState.score}`, { fontSize: '24px', fill: '#ffd700' });
        this.timeText = this.add.text(this.gameWidth / 2, 20, `Time: ${this.gameTime}s`, { fontSize: '24px', fill: '#ffffff' }).setOrigin(0.5, 0);

        // Tạo nút Shop ở bên phải
        const shopButton = this.add.image(this.gameWidth - 80, 30, 'shop-button').setInteractive();
        shopButton.setDisplaySize(40, 40);
        shopButton.setTint(0xdd8153);
        shopButton.on('pointerdown', () => {
            this.scene.launch('ShopScene');
            this.scene.pause();
        });

        // Thiết lập bộ đếm thời gian game
        this.gameTimer = this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });

        // Thiết lập điều khiển bàn phím cho các phím mũi tên
        this.cursors = this.input.keyboard.createCursorKeys();

        // Thêm lắng nghe sự kiện thay đổi kích thước
        this.scale.on('resize', this.resize, this);
    }

    // Xử lý khi thay đổi kích thước màn hình
    resize(gameSize) {
        // Cập nhật kích thước game
        this.gameWidth = gameSize.width;
        this.gameHeight = gameSize.height;

        // Cập nhật nền
        this.background.setSize(this.gameWidth, this.gameHeight);
        this.background.setPosition(this.gameWidth / 2, this.gameHeight / 2);

        // Cập nhật ranh giới thế giới theo kích thước mới
        this.physics.world.setBounds(0, 0, this.gameWidth, this.gameHeight);

        // Cập nhật vị trí các phần tử giao diện
        this.miner.setPosition(this.gameWidth / 2, 50);
        this.timeText.setPosition(this.gameWidth / 2, 20);
        this.scoreText.setPosition(20, 20);

        // Tạo lại vật phẩm để phù hợp với kích thước màn hình mới
        this.spawnTreasures();
    }

    // Xử lý khi hook va chạm với ranh giới thế giới
    onHitWorldBounds(up, down, left, right) {
        // Bắt đầu thu hồi CHỈ KHI chạm ranh giới và vẫn đang mở rộng
        if (this.hookExtending && !this.hookRetracting) {
            this.hookExtending = false;
            this.hookRetracting = true;

            // Hiển thị thông tin debug về ranh giới bị chạm
            if (this.debugText) {
                let hitDirection = '';
                if (up) hitDirection = 'top';
                if (down) hitDirection = 'bottom';
                if (left) hitDirection = 'left';
                if (right) hitDirection = 'right';
                this.debugText.setText(`Hit ${hitDirection} boundary`);
            }
        }
    }

    update() {
        if (this.gameOver) return;
        // Cập nhật chuyển động lắc của hook
        this.updateHookSwing();

        // Kiểm tra phím mũi tên xuống để mở rộng hook
        if ((this.cursors.down.isDown || this.cursors.space.isDown) && !this.hookExtending && !this.hookRetracting) {
            this.hookExtending = true;
        }

        // Cập nhật độ dài và vị trí của dây
        if (this.hookExtending) {
            this.extendRope();
        } else if (this.hookRetracting) {
            this.retractRope();
        }

        // Vẽ dây từ người thợ đến hook
        this.drawRope();

        // Cập nhật góc quay của hook theo góc của dây
        this.updateHookRotation();

        // Nếu hook có vật phẩm, di chuyển vật phẩm theo hook
        if (this.hookedItem) {
            // Đặt vị trí vật phẩm bên dưới hook
            this.hookedItem.x = this.hook.x;
            this.hookedItem.y = this.hook.y + 20;
        }

        // Kiểm tra va chạm với vật phẩm chỉ khi hook đang mở rộng
        if (this.hookExtending && !this.hookedItem) {
            this.physics.overlap(this.hook, this.treasures, this.collectTreasure, null, this);
        }
    }

    // Cập nhật chuyển động lắc của hook
    updateHookSwing() {
        // Chỉ lắc khi hook không mở rộng hoặc thu hồi
        if (!this.hookExtending && !this.hookRetracting) {
            // Cập nhật góc lắc
            this.swingAngle += this.swingSpeed * this.swingDirection;

            // Đảo hướng khi đạt góc tối đa
            if (Math.abs(this.swingAngle) >= this.maxSwingAngle) {
                this.swingDirection *= -1;
            }

            // Tính toán vị trí hook dựa trên góc và độ dài dây mặc định
            const baseRopeLength = 50; // Khoảng cách cơ bản khi không mở rộng
            const hookX = this.miner.x + Math.sin(this.swingAngle) * baseRopeLength;
            const hookY = this.miner.y + Math.cos(this.swingAngle) * baseRopeLength;

            // Đặt vị trí hook
            this.hook.x = hookX;
            this.hook.y = hookY;
        }
    }

    // Vẽ dây
    drawRope() {
        // Xóa dây cũ
        this.rope.clear();

        // Vẽ đường dây từ người thợ đến hook
        this.rope.lineStyle(5, 0xdd8153);
        this.rope.beginPath();
        this.rope.moveTo(this.miner.x, this.miner.y);
        this.rope.lineTo(this.hook.x, this.hook.y);
        this.rope.closePath();
        this.rope.strokePath();
    }

    // Tạo vật phẩm
    spawnTreasures() {
        // Xóa tất cả vật phẩm hiện có
        this.treasures.clear(true, true);

        // Định nghĩa kích thước cho va chạm
        const itemSizes = {
            'gold-small': { width: 30, height: 30 },
            'gold-medium': { width: 40, height: 40 },
            'gold-large': { width: 50, height: 50 },
            'rock-small': { width: 30, height: 30 },
            'rock-medium': { width: 40, height: 40 },
            'rock-large': { width: 50, height: 50 }
        };

        // Tạo vàng và đá ngẫu nhiên
        for (let i = 0; i < 15; i++) {
            // Điều chỉnh khu vực tạo theo kích thước màn hình
            const x = Phaser.Math.Between(100, this.gameWidth - 100);
            const y = Phaser.Math.Between(200, this.gameHeight - 100);

            if (Phaser.Math.Between(1, 10) <= 5) {
                // Chọn kích thước vàng ngẫu nhiên
                const goldType = Phaser.Math.Between(1, 3);
                let goldKey, goldValue, goldSize;

                switch (goldType) {
                    case 1:
                        goldKey = 'gold-small';
                        goldValue = 10;
                        goldSize = 1;
                        break;
                    case 2:
                        goldKey = 'gold-medium';
                        goldValue = 25;
                        goldSize = 2;
                        break;
                    case 3:
                        goldKey = 'gold-large';
                        goldValue = 50;
                        goldSize = 3;
                        break;
                }

                const gold = this.treasures.create(x, y, goldKey);

                // Điều chỉnh kích thước hình ảnh vàng theo kích thước va chạm
                const goldSizeInfo = itemSizes[goldKey];
                gold.setDisplaySize(goldSizeInfo.width, goldSizeInfo.height);

                gold.setData('value', goldValue);
                gold.setData('type', 'gold');
                gold.setData('size', goldSize); // Lưu kích thước để tính tốc độ kéo

                // Đặt vàng cố định và không bị ảnh hưởng bởi trọng lực
                gold.body.allowGravity = false;
                gold.body.immovable = true;

                // Cập nhật thân vật lý để khớp với kích thước hiển thị
                gold.body.setSize(goldSizeInfo.width, goldSizeInfo.height);
            } else {
                // Chọn kích thước đá ngẫu nhiên
                const rockType = Phaser.Math.Between(1, 3);
                let rockKey, rockValue, rockSize, sizeKey;

                switch (rockType) {
                    case 1:
                        rockKey = 'rock-small';
                        rockValue = 3;
                        rockSize = 1; // Kích thước 1 cho nhỏ
                        break;
                    case 2:
                        rockKey = 'rock-medium';
                        rockValue = 5;
                        rockSize = 2; // Kích thước 2 cho vừa
                        break;
                    case 3:
                        rockKey = 'rock-large';
                        rockValue = 8;
                        rockSize = 3; // Kích thước 3 cho lớn
                        break;
                }

                const rock = this.treasures.create(x, y, rockKey);

                // Điều chỉnh kích thước hình ảnh đá theo kích thước va chạm
                const rockSizeInfo = itemSizes[rockKey];
                rock.setDisplaySize(rockSizeInfo.width, rockSizeInfo.height);
                rock.body.setSize(rockSizeInfo.width * 20, rockSizeInfo.height);
                rock.setData('type', 'rock');
                rock.setData('value', rockValue);
                rock.setData('size', rockSize); // Lưu kích thước để tính tốc độ kéo

                // Đặt đá cố định và không bị ảnh hưởng bởi trọng lực
                rock.body.allowGravity = false;
                rock.body.immovable = true;

                // Cập nhật thân vật lý để khớp với kích thước hiển thị

            }
        }
    }

    // Mở rộng dây
    extendRope() {
        // Lưu góc hiện tại khi bắt đầu mở rộng
        if (this.hookLength === 0) {
            this.extendAngle = this.swingAngle;
        }

        // Tính toán tốc độ tương đối với kích thước màn hình
        const baseSpeed = 3;
        const speedMultiplier = Math.max(this.gameHeight / 1040);

        // Tăng độ dài dây với tốc độ dựa trên kích thước màn hình và nâng cấp
        this.hookLength += baseSpeed * speedMultiplier * gameState.upgrades.ropeSpeed;

        // Tính toán vị trí hook dựa trên góc cố định và độ dài tăng dần
        const hookX = this.miner.x + Math.sin(this.extendAngle) * (this.hookLength + 50);
        const hookY = this.miner.y + Math.cos(this.extendAngle) * (this.hookLength + 50);

        // Đặt vị trí hook
        this.hook.x = hookX;
        this.hook.y = hookY;
    }

    // Thu hồi dây
    retractRope() {
        // Tốc độ thu hồi cơ bản dựa trên nâng cấp
        let retractSpeed = 4 * gameState.upgrades.ropeSpeed;

        // Nếu đang mang vật phẩm, điều chỉnh tốc độ theo loại và kích thước
        if (this.hookedItem) {
            const itemType = this.hookedItem.getData('type');
            const itemSize = this.hookedItem.getData('size');
            if (itemType === 'gold') {
                retractSpeed = (4 - itemSize) * gameState.upgrades.ropeSpeed;
            } else if (itemType === 'rock') {
                retractSpeed = Math.max(1.5, (4 - itemSize)) * gameState.upgrades.ropeSpeed;

                // Nếu người chơi có thuốc nổ, họ có thể phá đá
                if (gameState.upgrades.hasDynamite > 0 && this.cursors.up.isDown) {
                    gameState.upgrades.hasDynamite = gameState.upgrades.hasDynamite - 1
                    this.hookedItem.destroy();
                    this.hookedItem = null;
                    this.sound.play('boom');
                    // Hiển thị hiệu ứng nổ
                    this.exploxer = this.add.circle(this.hook.x, this.hook.y, 30, 0xff0000).setAlpha(0.8);
                    this.tweens.add({
                        targets: this.exploxer,
                        scale: { from: 3, to: 0 },
                        duration: 500,
                        ease: 'Power2'
                    });

                    // Đặt lại tốc độ thu hồi sau khi phá đá
                    retractSpeed = 4 * gameState.upgrades.ropeSpeed;
                    setTimeout(() => {
                        this.exploxer.destroy();
                    }, 500);
                }
            }
        }

        this.hookLength -= retractSpeed;

        // Tính toán vị trí hook dựa trên góc cố định và độ dài giảm dần
        const hookX = this.miner.x + Math.sin(this.extendAngle) * (this.hookLength + 50);
        const hookY = this.miner.y + Math.cos(this.extendAngle) * (this.hookLength + 50);

        // Đặt vị trí hook
        this.hook.x = hookX;
        this.hook.y = hookY;

        // Kiểm tra nếu hook đã thu hồi hoàn toàn
        if (this.hookLength <= 0) {
            this.hookLength = 0;
            this.hookRetracting = false;

            // Nếu đang mang vật phẩm, cộng điểm và xóa vật phẩm
            if (this.hookedItem) {
                gameState.score += this.hookedItem.getData('value');
                this.scoreText.setText('Gold: ' + gameState.score);
                this.hookedItem.destroy();
                this.hookedItem = null;
            }

            // Tạo vật phẩm mới nếu tất cả đã được thu thập
            let treasuresRemaining = this.treasures.getChildren().length;
            if (treasuresRemaining === 0) {
                this.spawnTreasures();
            }
        }
    }

    // Thu thập vật phẩm
    collectTreasure(hook, treasure) {
        // Không thu thập nếu đã mang vật phẩm
        if (this.hookedItem) return;

        // Bắt đầu thu hồi với vật phẩm
        this.hookedItem = treasure;
        this.hookExtending = false;
        this.hookRetracting = true;
    }

    // Cập nhật bộ đếm thời gian
    updateTimer() {
        this.gameTime--;
        this.timeText.setText('Time: ' + this.gameTime + 's');

        // Kết thúc game khi hết thời gian
        if (this.gameTime <= 0) {
            this.gameOver = true;
            this.gameTimer.remove();
            this.endGame();
        }
    }

    // Kết thúc game
    endGame() {
        // Hiển thị thông báo kết thúc game
        const messageBox = this.add.rectangle(this.gameWidth / 2, this.gameHeight / 2, 400, 200, 0x000000, 0.8).setOrigin(0.5);
        const gameOverText = this.add.text(this.gameWidth / 2, this.gameHeight / 2 - 40, 'Game Over!', { fontSize: '32px', fill: '#ffffff' }).setOrigin(0.5);
        const scoreText = this.add.text(this.gameWidth / 2, this.gameHeight / 2 + 10, 'Final Score: ' + gameState.score, { fontSize: '24px', fill: '#ffd700' }).setOrigin(0.5);

        // Nút chơi lại
        const restartButton = this.add.text(this.gameWidth / 2, this.gameHeight / 2 + 60, 'Play Again', {
            fontSize: '20px',
            fill: '#ffffff',
            backgroundColor: '#444444',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setInteractive();

        restartButton.on('pointerdown', () => {
            gameState.score = 0;
            this.scene.restart();
        });

    }

    // Cập nhật góc quay của hook dựa trên góc của dây
    updateHookRotation() {
        // Tính góc của dây (góc giữa người thợ và hook)
        const dx = this.hook.x - this.miner.x;
        const dy = this.hook.y - this.miner.y;
        const ropeAngle = Math.atan2(dx, dy);

        // Đặt góc quay của hook theo góc của dây
        this.hook.setRotation(- ropeAngle);
    }
} 