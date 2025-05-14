class RentedMineGameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'RentedMineGameScene' });
        // Thời gian chơi game (giây)
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
        // Thêm biến theo dõi trạng thái touch
        this.isTouching = false;

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
        this.load.image('backgrounds', 'assets/images/play_bg.jpg');
        this.load.image('miner', 'assets/images/user.png');
        this.load.image('mine-door', 'assets/images/mine-door.png');
        this.load.image('wood', 'assets/images/wood.png');
        this.load.image('back', 'assets/images/back.png');
        this.load.image('hook', 'assets/images/hook.png');
        this.load.image('gold-small', 'assets/images/gold-3.png');
        this.load.image('gold-medium', 'assets/images/gold-3.png');
        this.load.image('gold-large', 'assets/images/gold-3.png');
        this.load.image('rock-small', 'assets/images/rock-1.png');
        this.load.image('rock-medium', 'assets/images/rock-1.png');
        this.load.image('rock-large', 'assets/images/rock-1.png');
        this.load.image('shop-button', 'assets/images/shop.png');
        this.load.audio('boom', 'assets/sounds/boom.mp3');
        this.load.audio('mine', 'assets/sounds/mine.mp3');
        this.load.audio('collect', 'assets/sounds/collect.mp3');
    }

    create() {
        this.cameras.main.fadeIn(500, 0, 0, 0);
        // Khởi tạo lại trạng thái game nếu cần
        this.gameOver = false;
        this.hookExtending = false;
        this.hookRetracting = false;
        this.hookLength = 0;
        this.hookedItem = null;
        this.swingAngle = 0;
        this.swingDirection = 1;
        this.isTouching = false;

        // Lấy kích thước màn hình game
        const gameWidth = this.scale.width;
        const gameHeight = this.scale.height;

        // Tạo nền cho khu vực game
        const background = this.add.image(gameWidth / 2, gameHeight / 2 + 100, 'backgrounds')
        this.scaleBackgroundToFill(background, gameWidth, gameHeight)

        // Back
        const backButton = this.add.image(20, 20, `back`)
            .setScale(0.09, 0.1)
            .setOrigin(0, 0)
            .setInteractive()
            .setPosition(10, 0);


        backButton.on('pointerdown', () => {
            this.scene.start('SelectGameScene');
        });

        // Tạo người thợ mỏ ở vị trí trên cùng giữa màn hình
        // this.miner = this.add.image(gameWidth / 2, 0, 'mine-door')
        //     .setPosition(gameWidth / 2, 270)
        //     .setOrigin(0.5, 0.75);

        this.miner = this.add.image(gameWidth / 2, 0, 'miner')
            .setPosition(gameWidth / 2, 270)
            .setOrigin(0.35, 0.72);
        this.miner.setDisplaySize(200, 200);

        // Tạo hook và dây
        this.rope = this.add.graphics();
        this.hook = this.physics.add.image(gameWidth / 2, 0, 'hook');
        this.hook.setOrigin(0.5, 0.5);
        this.hook.setDisplaySize(40, 30);
        this.hook.body.setSize(160, 160);
        // Thiết lập ranh giới thế giới game
        this.physics.world.setBounds(0, 0, gameWidth, gameHeight);

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
        this.spawnTreasures(gameWidth, gameHeight);

        // Score
        this.scoreText = this.add.text(0, 0, `Gold: ${gameState.gold}`, {
            fontSize: '34px',
            fontFamily: 'MyFont',
            fontWeight: 'bold',
            stroke: '#000000',
            strokeThickness: 3,
            fill: '#ffffff'
        })
            .setOrigin(0, 0)
            .setPosition(60, 130);
        // Tạo nút Shop ở bên phải
        const shopButton = this.add.text(gameWidth - 170, 30, 'Shop', {
            fontSize: '44px',
            fontFamily: 'MyFont',
            fontWeight: 'bold',
            stroke: '#000000',
            strokeThickness: 3,
            fill: '#ffffff'
        })
            .setInteractive()

        shopButton.on('pointerdown', () => {
            this.scene.pause();
            this.scene.launch('ShopScene');
        });

        // Thiết lập điều khiển bàn phím cho các phím mũi tên
        this.cursors = this.input.keyboard.createCursorKeys();

        // Thêm xử lý sự kiện touch
        this.input.on('pointerdown', (pointer) => {
            this.isTouching = true;

            // Nếu đang móc đá và có pháo, sử dụng pháo
            if (this.hookedItem &&
                this.hookedItem.getData('type') === 'rock' &&
                gameState.upgrades.hasDynamite > 0) {
                gameState.upgrades.hasDynamite = gameState.upgrades.hasDynamite - 1;
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
                setTimeout(() => {
                    this.exploxer.destroy();
                }, 500);
            }
            // Nếu không đang mở rộng hoặc thu hồi, bắt đầu mở rộng
            else if (!this.hookExtending && !this.hookRetracting) {
                this.hookExtending = true;
            }
        });

        this.input.on('pointerup', () => {
            this.isTouching = false;
        });
    }
    // Xử lý khi hook va chạm với ranh giới thế giới
    onHitWorldBounds(up, down, left, right) {
        // Bắt đầu thu hồi CHỈ KHI chạm ranh giới và vẫn đang mở rộng
        if (this.hookExtending && !this.hookRetracting) {
            this.hookExtending = false;
            this.hookRetracting = true;

        }
    }

    update(gameWidth, gameHeight) {
        if (this.gameOver) return;
        // Cập nhật chuyển động lắc của hook
        this.updateHookSwing(gameWidth, gameHeight);

        // Kiểm tra phím mũi tên xuống hoặc touch để mở rộng hook
        if ((this.cursors.down.isDown || this.cursors.space.isDown || this.isTouching) && !this.hookExtending && !this.hookRetracting) {
            this.hookExtending = true;
        }

        // Cập nhật độ dài và vị trí của dây
        if (this.hookExtending) {
            this.extendRope(gameWidth, gameHeight);
        } else if (this.hookRetracting) {
            this.retractRope(gameWidth, gameHeight);
        }

        // Vẽ dây từ người thợ đến hook
        this.drawRope(gameWidth, gameHeight);

        // Cập nhật góc quay của hook theo góc của dây
        this.updateHookRotation(gameWidth, gameHeight);

        // Nếu hook có vật phẩm, di chuyển vật phẩm theo hook
        if (this.hookedItem) {
            // Đặt vị trí vật phẩm bên dưới hook
            // Chuyển tỉ lệ sang độ
            let angleDeg = this.swingAngle * 60;
            let angleRad = Phaser.Math.DegToRad(angleDeg);

            let distance = 15;
            this.hookedItem.x = this.hook.x + distance * Math.sin(angleRad);
            this.hookedItem.y = this.hook.y + distance * Math.cos(angleRad);


        }

        // Kiểm tra va chạm với vật phẩm chỉ khi hook đang mở rộng
        if (this.hookExtending && !this.hookedItem) {
            this.physics.overlap(this.hook, this.treasures, this.collectTreasure, null, this);
        }
    }

    // Cập nhật chuyển động lắc của hook
    updateHookSwing(gameWidth, gameHeight) {
        // Chỉ lắc khi hook không mở rộng hoặc thu hồi
        if (!this.hookExtending && !this.hookRetracting) {
            // Cập nhật góc lắc
            this.swingAngle += this.swingSpeed * this.swingDirection;

            // Đảo hướng khi đạt góc tối đa
            if (Math.abs(this.swingAngle) >= this.maxSwingAngle) {
                this.swingDirection *= -1;
            }

            // Tính toán vị trí hook dựa trên góc và độ dài dây mặc định
            const baseRopeLength = 70; // Khoảng cách cơ bản khi không mở rộng
            const hookX = this.miner.x + Math.sin(this.swingAngle) * baseRopeLength;
            const hookY = this.miner.y + Math.cos(this.swingAngle) * baseRopeLength;

            // Đặt vị trí hook
            this.hook.x = hookX;
            this.hook.y = hookY;
        }
    }

    // Vẽ dây
    drawRope(gameWidth, gameHeight) {
        // Xóa dây cũ
        this.rope.clear();

        // Vẽ đường dây từ người thợ đến hook
        this.rope.lineStyle(5, 0x44423d);
        this.rope.beginPath();
        this.rope.moveTo(this.miner.x, this.miner.y);
        this.rope.lineTo(this.hook.x, this.hook.y);
        this.rope.closePath();
        this.rope.strokePath();
    }

    // Tạo vật phẩm
    spawnTreasures(gameWidth, gameHeight) {
        // Xóa tất cả vật phẩm hiện có
        this.treasures.clear(true, true);

        // Định nghĩa kích thước cho va chạm
        const itemSizes = {
            'gold-small': { width: 0.04, height: 0.04 },
            'gold-medium': { width: 0.055, height: 0.055 },
            'gold-large': { width: 0.075, height: 0.075 },
            'rock-small': { width: 0.04, height: 0.04 },
            'rock-medium': { width: 0.055, height: 0.055 },
            'rock-large': { width: 0.075, height: 0.075 }
        };

        // Tạo vàng và đá ngẫu nhiên
        for (let i = 0; i < 100; i++) {
            // Điều chỉnh khu vực tạo theo kích thước màn hình
            const x = Phaser.Math.Between(50, gameWidth - 50);
            const y = Phaser.Math.Between(450, gameHeight - 50);

            if (Phaser.Math.Between(1, 10) <= 4) {
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
                gold.setScale(goldSizeInfo.width, goldSizeInfo.height);
                gold.setData('value', goldValue);
                gold.setData('type', 'gold');
                gold.setData('size', goldSize); // Lưu kích thước để tính tốc độ kéo

                // Đặt vàng cố định và không bị ảnh hưởng bởi trọng lực
                gold.body.allowGravity = false;
                gold.body.immovable = true;

                // Cập nhật thân vật lý để khớp với kích thước hiển thị

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
                rock.setScale(rockSizeInfo.width, rockSizeInfo.height);
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
    extendRope(gameWidth, gameHeight) {
        // Lưu góc hiện tại khi bắt đầu mở rộng
        if (this.hookLength === 0) {
            this.extendAngle = this.swingAngle;
        }

        // Tính toán tốc độ tương đối với kích thước màn hình
        const baseSpeed = 3;

        // Tăng độ dài dây với tốc độ dựa trên kích thước màn hình và nâng cấp
        this.hookLength += baseSpeed * gameState.upgrades.ropeSpeed;

        // Tính toán vị trí hook dựa trên góc cố định và độ dài tăng dần
        const hookX = this.miner.x + Math.sin(this.extendAngle) * (this.hookLength + 50);
        const hookY = this.miner.y + Math.cos(this.extendAngle) * (this.hookLength + 50);

        // Đặt vị trí hook
        this.hook.x = hookX;
        this.hook.y = hookY;
    }

    // Thu hồi dây
    retractRope(gameWidth, gameHeight) {
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
                gameState.gold += this.hookedItem.getData('value');
                this.scoreText.setText('Gold: ' + gameState.gold);
                this.hookedItem.destroy();
                this.hookedItem = null;
            }

            // Tạo vật phẩm mới nếu tất cả đã được thu thập
            let treasuresRemaining = this.treasures.getChildren().length;
            if (treasuresRemaining === 0) {
                this.spawnTreasures(gameWidth, gameHeight);
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

    // Cập nhật góc quay của hook dựa trên góc của dây
    updateHookRotation(gameWidth, gameHeight) {
        // Tính góc của dây (góc giữa người thợ và hook)
        const dx = this.hook.x - this.miner.x;
        const dy = this.hook.y - this.miner.y;
        const ropeAngle = Math.atan2(dx, dy);

        // Đặt góc quay của hook theo góc của dây
        this.hook.setRotation(- ropeAngle);
    }

    // Scale background to fill
    scaleBackgroundToFill(image, targetWidth, targetHeight) {
        const imgWidth = image.width;
        const scale = targetWidth / imgWidth;
        image.setScale(scale);
        image.setPosition(targetWidth / 2, targetHeight / 2);
    }
} 