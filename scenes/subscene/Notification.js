class Notification {
    constructor(scene) {
        this.scene = scene;
        this.container = this.scene.add.container(this.scene.scale.width / 2, this.scene.scale.height / 2);
        this.container.setVisible(false);

        const background = this.scene.add.rectangle(0, 0, 400, 200, 0x000000, 0.8);
        const text = this.scene.add.text(0, -50, '', {
            fontSize: '32px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5);

        // Thêm input và nút submit
        const input = this.scene.add.dom(0, 0).createFromHTML('<input type="text" placeholder="Enter code" style="width: 200px; height: 30px; font-size: 16px;">');
        const submitButton = this.scene.add.text(0, 50, 'Submit', {
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#007bff',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5).setInteractive();

        this.container.add([background, text, input, submitButton]);
        this.text = text;
        this.input = input;
        this.submitButton = submitButton;
    }

    show(message) {
        this.text.setText(message);
        this.container.setVisible(true);
    }

    hide() {
        this.container.setVisible(false);
    }
}
