let bullets = [];
        let bossBullets = [];
        let canShoot = true;
        let bossHealth = 100; 
        let playerPower = 100; 
        let playerBullets = 0; 
        let bossAppeared = false;
        let playerHealth = 100;
        let inBossFight = false;
        let countdownActive = true;
        let bossShootInterval;

        const canvas = document.getElementById("gameCanvas");
        const ctx = canvas.getContext("2d");
        const countdownElement = document.getElementById("countdown");
        const playAgainBtn = document.getElementById("playAgain");

        let player, obstacles, items, boss, power, gamePaused, playerShots, bossShots, gameSpeed;

        const images = {
            player: loadImage("player.png"),
            boss: loadImage("boss.png"),
            clipboard: loadImage("clipboard.png"),
            pencil: loadImage("pencil.png"),
            paper: loadImage("paper.png"),
            book: loadImage("book.png"),
            dango: loadImage("dango.png"),
            juice: loadImage("juice.png"),
            ribbon: loadImage("ribbon.png"),
            bullet: loadImage("bullet.png") 
        };

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = "yellow";
            bullets.forEach(bullet => {
                ctx.fillRect(bullet.x, bullet.y, 5, 10);
            });
            
            ctx.fillStyle = "red";
            bossBullets.forEach(bullet => {
                ctx.fillRect(bullet.x, bullet.y, 5, 10);
            });
            
            drawBackground();
            drawPlayer();
            drawObstacles();
            drawScore();
            drawLogo(); // Gọi hàm vẽ logo
        }
        
        function loadImage(src) {
            const img = new Image();
            img.src = "images/" + src;
            return img;
        }

        function initializeGame() {
            player = { x: 50, y: 250, width: 130, height: 130, dy: 0, gravity: 0.5, jumpPower: -22, onGround: true };
            boss = { x: 800, y: 100, width: 100, height: 100, health: 100 };
            bossHealth = 100;     
            playerPower = 100;     
            bossAppeared = false;
            obstacles = [];
            items = [];
            boss = null;
            power = 150;
            gamePaused = false;
            inBossFight = false;
            playerShots = 0;
            bossShots = 0;
            gameSpeed = 4;
            playAgainBtn.style.display = "none";
            bullets = [];         
            bossBullets = [];
            createObstaclesAndItems();
            countdown();

            ctx.restore();
        
        }

        function createObstaclesAndItems() {
            const obstacleTypes = ["clipboard", "pencil", "paper", "book"];
            const itemTypes = ["dango", "juice", "ribbon"];
        
            for (let i = 1; i <= 50; i++) {
                let randomObstacle = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
                let obstacleHeight = 65; // Kích thước mới đã tăng
                obstacles.push({ x: i * 350, y: 350 - obstacleHeight, width: 65, height: obstacleHeight, type: randomObstacle });
        
                if (i % 5 === 0) {
                    let randomItem = itemTypes[Math.floor(Math.random() * itemTypes.length)];
                    let itemHeight = 65;
                    items.push({ x: i * 200, y: 200 - itemHeight, width: 65, height: itemHeight, type: randomItem });
                }
            }
            boss = { x: 13500, y: 150, width: 180, height: 180, type: "boss" };
        }

        function drawImage(type, x, y, width, height) {
            ctx.drawImage(images[type], x, y, width, height);
        }

        function drawGame() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        
            // Nếu đang đếm ngược thì chỉ vẽ màn hình đen và thoát
            if (countdownActive) {
                ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                return; // Không vẽ gì thêm
            }
            // Nếu countdown đã kết thúc, vẽ game bình thường
            ctx.save();

            // Vẽ video background nếu đã tải xong
            const bgVideo = document.getElementById("bgVideo");
            if (bgVideo.readyState >= 2) {
                ctx.drawImage(bgVideo, 0, 0, canvas.width, canvas.height);
            }
        
            // Lưu trạng thái canvas
            ctx.save();
        
            // Hiển thị "Power" và điểm số sau khi countdown kết thúc
            ctx.font = "30px '04b_30__'";
            ctx.fillStyle = "white";
        
            // Hiệu ứng viền chữ
            ctx.lineWidth = 4;
            ctx.strokeStyle = "#ffb2b2";
            ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
            ctx.shadowBlur = 8;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 5;
        
            // Vẽ chữ "Power"
            ctx.strokeText("Power:", 20, 40);
            ctx.fillText("Power:", 20, 40);

            // Vẽ số điểm (power)
            ctx.font = "50px '04b_30__'";
            ctx.strokeText(power, 20, 90);
            ctx.fillText(power, 20, 90);
        
            // Phục hồi trạng thái canvas
            ctx.restore();
        
            // Vẽ nhân vật, vật cản, item, boss (nếu có)
            drawImage("player", player.x, player.y, player.width, player.height);
            obstacles.forEach(o => drawImage(o.type, o.x, o.y, o.width, o.height));
            items.forEach(i => drawImage(i.type, i.x, i.y, i.width, i.height));
            if (boss) drawImage(boss.type, boss.x, boss.y, boss.width, boss.height);

            bullets.forEach(bullet => ctx.drawImage(images.bullet, bullet.x, bullet.y, 20, 20));
            bossBullets.forEach(bullet => ctx.drawImage(images.bullet, bullet.x, bullet.y, 20, 20));
        
            // Vẽ mặt đất
            ctx.fillStyle = "#bca47b";
            ctx.fillRect(0, 350, canvas.width, 50);
        
            // Vẽ viền đen cho mặt đất
            ctx.strokeStyle = "black";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, 350);
            ctx.lineTo(canvas.width, 350);
            ctx.stroke();
            
        }  
        
        function togglePause() {
            gamePaused = !gamePaused; // Đảo trạng thái pause
            const pauseButtonImg = document.getElementById("pauseButtonImg");
        
            if (gamePaused) {
                pauseButtonImg.src = "images/ButtonPlay.png"; // Chuyển thành nút Play
            } else {
                pauseButtonImg.src = "images/ButtonPause.png"; // Chuyển thành nút Pause
                updateGame(); // Tiếp tục game
            }
        }

        function drawHealthBar(health, label, x, y) {
            ctx.fillStyle = "#574144"; 
            ctx.fillRect(x, y, 110, 20);
            
            ctx.fillStyle = "#ff6f91"; 
            ctx.fillRect(x + 5, y + 5, Math.max(0, Math.min(100, health)), 10);
            
            ctx.fillStyle = "white";
            ctx.font = "12px Arial";
            ctx.fillText(label, x, y - 5);
        }

        function bossFight() {
            if (!bossAppeared || gamePaused) return;

            if (bossHealth <= 0 || playerPower <= 0) {
                stopBossShooting();
                return;
            }
            drawGame();

            for (let i = bullets.length - 1; i >= 0; i--) {
                let bullet = bullets[i];
                bullet.x += bullet.speed;

                if (checkCollision(bullet, boss)) {
                    bossHealth -= 10;
                    bullets.splice(i, 1);
                }

                if (bullet.x > canvas.width) {
                    bullets.splice(i, 1); 
                }
            }

            if (Math.random() < 0.02) { 
                bossBullets.push({
                    x: boss.x, 
                    y: boss.y + boss.height / 2, 
                    width: 10, 
                    height: 5, 
                    speed: 7
                });
            }

            for (let i = bossBullets.length - 1; i >= 0; i--) {
                let bullet = bossBullets[i];
                bullet.x -= bullet.speed; 

                if (checkCollision(bullet, player)) {
                    playerPower -= 10;
                    bossBullets.splice(i, 1);
                }

                if (bullet.x < 0) {
                    bossBullets.splice(i, 1); 
                }
            }

            drawHealthBar(playerPower, "Học sinh", 50, 150);
            drawHealthBar(bossHealth, "Giáo viên", canvas.width - 200, 120);

            requestAnimationFrame(bossFight);
        }

        function checkCollision(a, b) {
            return (
                a.x < b.x + b.width &&
                a.x + a.width > b.x &&
                a.y < b.y + b.height &&
                a.y + a.height > b.y
            );
        }

        function shootBullet() {
            if (canShoot) {
                bullets.push({ x: player.x + player.width, y: player.y + player.height / 2, width: 10, height: 5, speed: 7 });
                canShoot = false;
                setTimeout(() => canShoot = true, 300); // Thời gian giữa các phát bắn
            }
        }
        
        function updateGame() {
            if (gamePaused) return;

            player.y += player.dy;
            player.dy += player.gravity;

            if (player.y >= 200) {
                player.y = 200;
                player.dy = 0;
                player.onGround = true;
            } else {
                player.onGround = false;
            }

            // Cập nhật chướng ngại vật
            obstacles.forEach((o, index) => {
                o.x -= gameSpeed;
                if (o.x < -90) obstacles.splice(index, 1);
                if (checkCollision(player, o)) {
                    power -= 20;
                    obstacles.splice(index, 1);
                }
            });

            // Cập nhật vật phẩm
            items.forEach((i, index) => {
                i.x -= gameSpeed;
                if (checkCollision(player, i)) {
                    power += 20;
                    items.splice(index, 1);
                }
            });

            // Kiểm tra thua
            if (power <= 0) {
                ctx.fillText("You Lose", 350, 200);
                ctx.font = "60px '04b_30__'";
                ctx.fillStyle = "white";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.lineWidth = 4;
                ctx.strokeStyle = "pink";
                ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
                ctx.shadowBlur = 8;
                ctx.shadowOffsetX = 2;
                ctx.shadowOffsetY = 5;
                ctx.strokeText("You Lose", canvas.width / 2, canvas.height / 2);
                ctx.fillText("You Lose", canvas.width / 2, canvas.height / 2);
                playAgainBtn.style.display = "block";
                return;
            }

            // Boss xuất hiện
            if (boss && boss.x > 600) boss.x -= gameSpeed;
            if (boss && boss.x <= 600 && !bossAppeared) {
                bossAppeared = true;
                player.canJump = false; 
                obstacles = [];
                items = [];

                setTimeout(() => {
                    inBossFight = true;
                    bossFight();
                }, 1500);
            }

            // updateBossBullets();

            for (let i = bullets.length - 1; i >= 0; i--) {
                let bullet = bullets[i];
                bullet.x += bullet.speed; // Đạn bắn ngang

                if (checkCollision(bullet, boss)) {
                bossHealth -= 10;  
                bullets.splice(i, 1);  
            }
                if (bullet.x > canvas.width) bullets.splice(i, 1);
            }

            for (let i = bossBullets.length - 1; i >= 0; i--) {
                let bullet = bossBullets[i];
                bullet.x -= bullet.speed;

                if (checkCollision(bullet, player)) {
                    playerPower -= 10;
                    bossBullets.splice(i, 1);
                }

                if (bullet.x < 0) bossBullets.splice(i, 1);
            }

            if (bossAppeared && Math.random() < 0.05) {
                bossBullets.push({
                    x: boss.x,                 
                    y: boss.y + boss.height / 2,
                    speed: 5                  
                });
            }

            drawGame();
            requestAnimationFrame(updateGame);

            // Kiểm tra thắng/thua
            if (bossHealth <= 0 || playerPower <= 0) {
                let message = bossHealth <= 0 ? "YOU WIN" : "YOU LOSE";
                let color = bossHealth <= 0 ? "gold" : "pink";
                
                showEndScreen(message, color);
                
                gamePaused = true;
                return;
            }

        }
 
        function showEndScreen(message, color) {
            gamePaused = true;
            bossBullets = [];   
            bullets = []; 

            ctx.restore();

            ctx.save();
            ctx.font = "60px '04b_30__'";
            ctx.fillStyle = "white";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.lineWidth = 4;
            ctx.strokeStyle = color;
            ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
            ctx.shadowBlur = 8;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 5;

            ctx.strokeText(message, canvas.width / 2, canvas.height / 2);
            ctx.fillText(message, canvas.width / 2, canvas.height / 2);

            playAgainBtn.style.display = "block"; 
            cancelAnimationFrame(updateGame);
        }

        function countdown() {
            let count = 3;
            function tick() {
                if (count === 0) {
                    countdownElement.style.display = "none";
                    countdownActive = false; // Hết countdown -> tắt nền đen
                    updateGame();
                } else {
                    countdownElement.innerText = count === 1 ? "Ready" : count === 0 ? "Start!" : count;
                    count--;
                    setTimeout(tick, 1000);
                }
            }
            tick();
        }
        
        function gameOver() {
            gamePaused = true;
            document.getElementById("gameOverContainer").style.display = "block"; // Hiển thị thông báo game over
        }
        
        function restartGame() {
            playAgainBtn.style.display = "none";

            ctx.restore();

            initializeGame();
        }

        document.addEventListener("keydown", (event) => {
            if (event.key === "g" || event.key === "G") {
                shootBullet();
            }
        });
        document.addEventListener("keydown", function(event) {
            if (event.key === " " && player.onGround && player.canJump) {
                player.dy = -10; // Nhảy lên
                player.onGround = false;
            }
        });
        document.addEventListener("keydown", function(event) {
            if (event.code === "Space" && player.onGround) {
                player.dy = player.jumpPower;
                player.onGround = false;
            }
        });

        initializeGame();