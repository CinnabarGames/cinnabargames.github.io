// ======================= [ Helper Functions ] =======================

function prepareGrid(holder) {
    const grid = [];
    const tiles = holder.querySelectorAll('.tile');

    for (let i = 0; i < 20; i++) {
        grid[i] = [];
        for (let j = 0; j < 20; j++) {
            const tile = tiles[i * 20 + j];
            const gid = tile.getAttribute("gid");
            grid[i][j] = gid ? gid : 0;
        }
    }
    return grid;
}

function goalPoints(goal,player){
	let grid = prepareGrid(document.getElementById("S"+player));
	switch (goal){
		case '1': return 01*findLargestRectangle(grid);
		case '2': return [0,0,4,14,26,40,56,74][findLargestSquare(grid)];
		case '3': return 12*countDistinct3x3Squares(grid);
		case '4': return [0,0,8,12,16,22,30,40,52,66][findLargestColorGroup(grid)];
		case '5': return 03*findLongestDiagonal(grid);
		case '6': return 05*countPiecesWithThreeDifferentColors(grid);
		case '7': return 12*countUniqueColor2x2Squares(grid);
		case '8': return 09*countCompleteRowsAndColumns(grid);
		case '9': return 20*countFullSets(grid);
		case 'A': return 06*countIsolatedEmptyCells(grid);
		case 'B': return 03*countEnclosedEmptyClusters(grid);
		case 'C': return 30*countUnusedElements(grid);
	}
}

// ======================= [ Goal 01 ] =======================

function findLargestRectangle(grid) {
    let maxArea = 0;

    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[0].length; j++) {
            if (grid[i][j]) { // Only start from filled cells
                let minWidth = Infinity;
                for (let row = i; row < grid.length && grid[row][j]; row++) {
                    let width = 0;
                    while (j + width < grid[0].length && grid[row][j + width]) {
                        width++;
                    }
                    minWidth = Math.min(minWidth, width); // Find the minimum width as you go deeper
                    let height = row - i + 1;
                    let area = minWidth * height;
                    maxArea = Math.max(maxArea, area);
                }
            }
        }
    }

    return maxArea;
}

// ======================= [ Goal 02 ] =======================

function findLargestSquare(grid) {
    let maxSide = 0;

    // Iterate through each cell of the grid
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[0].length; j++) {
            // Only start calculating from a non-empty cell
            if (grid[i][j]&& (i === 0 || j === 0 || grid[i - 1][j - 1] === 0)) {
                let sideLength = 1; // Start with the smallest possible square
                let validSquare = true;

                // Attempt to expand the square as long as it remains valid
                while (validSquare && i + sideLength < grid.length && j + sideLength < grid[0].length) {
                    // Check the new row and column at the current bottom-right of the square
                    for (let k = 0; k <= sideLength; k++) {
                        if (grid[i + sideLength][j + k][0] !== grid[i][j][0] || grid[i + k][j + sideLength][0] !== grid[i][j][0]) {
                            validSquare = false;
                            break;
                        }
                    }
                    if (validSquare) { // If still valid, increase the side length
                        sideLength++;
                    }
                }
                // Update the maximum side length found so far
                maxSide = Math.max(maxSide, sideLength);
            }
        }
    }
    return maxSide;
}

// ======================= [ Goal 03 ] =======================

function countDistinct3x3Squares(grid) {
    let count = 0;
    const visited = Array.from({ length: grid.length }, () => Array(grid[0].length).fill(false));

    for (let i = 0; i <= grid.length - 3; i++) {
        for (let j = 0; j <= grid[0].length - 3; j++) {
            const color = grid[i][j][0];
            if (color && !visited[i][j]) {
                if (check3x3Square(grid, i, j, color)) {
                    count++;
                    markVisited(visited, i, j);
                }
            }
        }
    }

    return count;
}

function check3x3Square(grid, i, j, color) {
    for (let x = 0; x < 3; x++) {
        for (let y = 0; y < 3; y++) {
            if (grid[i + x][j + y][0] !== color) {
                return false;
            }
        }
    }
    return true;
}

function markVisited(visited, i, j) {
    for (let x = 0; x < 3; x++) {
        for (let y = 0; y < 3; y++) {
            visited[i + x][j + y] = true;
        }
    }
}

// ======================= [ Goal 04 ] =======================

function findLargestColorGroup(grid) {
    let maxCount = 0;
    const visited = Array.from({ length: grid.length }, () => Array(grid[0].length).fill(false));

    function floodFill(i, j, color) {
        if (i < 0 || i >= grid.length || j < 0 || j >= grid[0].length || visited[i][j] || grid[i][j][0] !== color) {
            return 0;
        }
        visited[i][j] = true;
        return 1 + floodFill(i + 1, j, color) + floodFill(i - 1, j, color) +
               floodFill(i, j + 1, color) + floodFill(i, j - 1, color);
    }

    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[0].length; j++) {
            if (!visited[i][j] && grid[i][j]) {
                const count = floodFill(i, j, grid[i][j][0]);
                maxCount = Math.max(maxCount, count);
            }
        }
    }

    return maxCount/4;
}

// ======================= [ Goal 05 ] =======================

function findLongestDiagonal(grid) {
    let maxLength = 0;

    // Helper function to count diagonal length from a starting point (i, j) in a specific direction (dx, dy)
    function countDiagonal(i, j, dx, dy) {
        let length = 1; // Start with current cell
        let x = i + dx;
        let y = j + dy;
        const color = grid[i][j][0];

        while (x >= 0 && x < grid.length && y >= 0 && y < grid[0].length && grid[x][y] && grid[x][y][0] === color) {
            length++;
            x += dx;
            y += dy;
        }
        return length;
    }

    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[0].length; j++) {
            if (grid[i][j]) {
                // Calculate the lengths of both possible diagonals starting at (i, j)
                const diag1Length = countDiagonal(i, j, 1, 1); // Down-right
                const diag2Length = countDiagonal(i, j, 1, -1); // Down-left

                // Update the maximum diagonal length found
                maxLength = Math.max(maxLength, diag1Length, diag2Length);
            }
        }
    }

    return maxLength;
}

// ======================= [ Goal 06 ] =======================

function countPiecesWithThreeDifferentColors(grid) {
    const pieceLocations = new Map();
    const colorTouches = new Map();

    // First, gather all pieces and their locations
    grid.forEach((row, x) => {
        row.forEach((cell, y) => {
            if (cell) {
                if (!pieceLocations.has(cell)) {
                    pieceLocations.set(cell, []);
                    colorTouches.set(cell, new Set());  // Set to track unique touching colors
                }
                pieceLocations.get(cell).push({ x, y });
            }
        });
    });

    // Now, check the neighbors of each piece for different colors
    pieceLocations.forEach((positions, gid) => {
        const primaryColor = gid[0];
        positions.forEach(({ x, y }) => {
            [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]].forEach(([nx, ny]) => {
                if (nx >= 0 && nx < grid.length && ny >= 0 && ny < grid[0].length) {
                    const neighbor = grid[nx][ny];
                    if (neighbor && neighbor !== gid) {
                        const neighborColor = neighbor[0];
                        if (neighborColor !== primaryColor) {
                            colorTouches.get(gid).add(neighborColor);
                        }
                    }
                }
            });
        });
    });

    // Count how many pieces have at least 3 different colors touching them
    let count = 0;
    colorTouches.forEach(colors => {
        if (colors.size >= 3) count++;
    });

    return count;
}

// ======================= [ Goal 07 ] =======================

function countUniqueColor2x2Squares(grid) {
    let count = 0;

    // Function to check if all elements in an array are unique
    function allUnique(arr) {
        return new Set(arr).size === arr.length;
    }

    // Loop through the grid, stopping one row and column early to fit the 2x2 squares
    for (let i = 0; i < grid.length - 1; i++) {
        for (let j = 0; j < grid[i].length - 1; j++) {
            // Extract the colors of the 2x2 square
            let colors = [
                grid[i][j][0],     // Top-left
                grid[i][j + 1][0], // Top-right
                grid[i + 1][j][0], // Bottom-left
                grid[i + 1][j + 1][0] // Bottom-right
            ];

            // Check if all four corners are filled and have unique colors
            if (grid[i][j] && grid[i][j + 1] && grid[i + 1][j] && grid[i + 1][j + 1] && allUnique(colors)) {
                count++;
            }
        }
    }

    return count;
}

// ======================= [ Goal 08 ] =======================

//function countCompleteRowsAndColumns(grid, Colors) {
function countCompleteRowsAndColumns(grid) {
    let rowCount = 0;
    let colCount = 0;
    const numCols = grid[0].length;
    const numRows = grid.length;

    // Check rows
    grid.forEach(row => {
        const rowColors = new Set(row.map(cell => cell[0]));
        if (Colors.every(color => rowColors.has(color))) {
            rowCount++;
        }
    });

    // Check columns
    for (let col = 0; col < numCols; col++) {
        const colColors = new Set();
        for (let row = 0; row < numRows; row++) {
            colColors.add(grid[row][col][0]); 
        }
        if (Colors.every(color => colColors.has(color))) {
            colCount++;
        }
    }

    return ( rowCount + colCount );
//    return { rowCount, colCount };
}

// ======================= [ Goal 09 ] =======================

function countFullSets(grid){
	let count = {"Y":0,"G":0,"B":0,"P":0,"R":0};
	let sets=[]
	
	grid.forEach((row)=>{
		row.forEach((cell)=>{
			let color = cell[0]
			if (count[color]!=undefined && color) {count[color]++}
		})
	})
	
	Object.keys(count).forEach((k)=>{sets.push(count[k])})
	return (Math.min(...sets)/4)
}

// ======================= [ Goal 10 ] =======================

function countIsolatedEmptyCells(grid) {
    let emptyCount = 0;

    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            // Check if the current cell is empty
            if (!grid[i][j]) {
                // Check surrounding cells to ensure all are non-empty
                const isIsolated = [
                    [i - 1, j], // Up
                    [i + 1, j], // Down
                    [i, j - 1], // Left
                    [i, j + 1]  // Right
                ].every(([x, y]) => {
                    // Ensure the surrounding cell exists and is not empty
                    return x >= 0 && x < grid.length &&
                           y >= 0 && y < grid[i].length &&
                           grid[x][y];
                });

                if (isIsolated) {
                    emptyCount++;
                }
            }
        }
    }

    return emptyCount;
}

// ======================= [ Goal 11 ] =======================

function countEnclosedEmptyClusters(grid) {
    let clusters = 0;
    const visited = Array.from({ length: grid.length }, () => Array(grid[0].length).fill(false));

    function floodFill(x, y) {
        // Base conditions to stop recursion
        if (x < 0 || x >= grid.length || y < 0 || y >= grid[0].length || visited[x][y] || grid[x][y]) {
            return 0;
        }
        visited[x][y] = true; // Mark this cell as visited

        // Count this cell in the cluster size
        let clusterSize = 1;

        // Recursively count connected empty cells in all four directions
        clusterSize += floodFill(x + 1, y);
        clusterSize += floodFill(x - 1, y);
        clusterSize += floodFill(x, y + 1);
        clusterSize += floodFill(x, y - 1);

        return clusterSize;
    }

    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            if (!visited[i][j] && !grid[i][j]) {
                // Flood fill from this cell if it's an unvisited empty cell
                const totalCells = floodFill(i, j);

                // Check if any cell in this cluster touched the grid's edge
                let touchesEdge = i === 0 || j === 0 || i === grid.length - 1 || j === grid[i].length - 1;

                // Add cluster size if it does not touch the edge
//                if (!touchesEdge) {
                if (!touchesEdge && totalCells<=5) {
                    clusters += totalCells;
                }
            }
        }
    }

    return clusters
//    return clusters.filter(cluster => cluster > 0); // Filter out zero-sized clusters if any
}

// ======================= [ Goal 12 ] =======================

function countUnusedElements(grid){
	let sets=[]
	grid.forEach((row)=>{
		row.forEach((cell)=>{
			let color = cell[0]
			if(!sets.includes(color)&&color){sets.push(color)}
		})
	})
	
	return (5-sets.length)
}