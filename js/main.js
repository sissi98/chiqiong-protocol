// 主应用入口文件
document.addEventListener('DOMContentLoaded', () => {
    console.log('赤穹协议网页版已加载');
    
    // 初始化游戏
    const game = new GameEngine();
    window.game = game; // 便于调试
    
    // 绑定控制按钮事件
    document.getElementById('new-game-btn').addEventListener('click', () => {
        if (confirm('确定开始新游戏吗？当前进度将丢失。')) {
            game.startNewGame();
        }
    });
    
    document.getElementById('save-game-btn').addEventListener('click', () => {
        game.saveGame();
        alert('游戏已保存！');
    });
    
    document.getElementById('load-game-btn').addEventListener('click', () => {
        if (game.loadGame()) {
            alert('游戏已加载！');
            game.updateUI();
        } else {
            alert('没有找到存档！');
        }
    });
    
    // 启动游戏
    game.initialize();
});