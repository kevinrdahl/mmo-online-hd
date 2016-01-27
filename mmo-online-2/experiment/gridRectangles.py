import random
import datetime
import io

gridWidth = 64
gridHeight = 64
grid = []
rectNum = 0
blockerFrequency = 0.1
symbols = '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
maxDimensionFactor = 3

def loadGrid(path):
	global gridWidth, gridHeight, grid

	f = open(path)
	lines = f.readlines()
	gridWidth = int(lines[0])
	gridHeight = int(lines[1])

	grid = [[] for x in range(gridWidth)]

	for y in range(gridHeight):
		for x in range(gridWidth):
			if lines[2+y][x] == 'x':
				grid[x].append(-2)
			else:
				grid[x].append(-1)


def populateGrid():
	global grid
	grid = []

	for x in range(gridWidth):
		grid.append([])
		for y in range(gridHeight):
			if random.random() < blockerFrequency:
				grid[x].append(-2) #not walkable
			else:
				grid[x].append(-1) #unassigned, walkable

def printGrid():
	for y in range(gridHeight):
		line = ''
		for x in range(gridWidth):
			val = grid[x][y]
			if val == -2:
				line += '+'
			elif val == -1:
				line += '.'
			else:
				line += symbols[val%len(symbols)]
		print(line)

def splitGrid():
	global rectNum

	for y in range(gridHeight):
		for x in range(gridWidth):
			if grid[x][y] == -1:
				#make the rect
				rectWidth = 1
				rectHeight = 1
				grid[x][y] = rectNum

				canExpandRight = (x < gridWidth-1 and grid[x+1][y] == -1)
				canExpandDown = (y < gridHeight-1 and grid[x][y+1] == -1)

				lastExpandWasRight = False

				while(True):
					#print('rect {}: canRight? {}, canDown? {}, lastRight? {}'.format(symbols[rectNum], canExpandRight, canExpandDown, lastExpandWasRight))

					if canExpandRight and ((not lastExpandWasRight) or (not canExpandDown)):
						#print('  expand right')
						rectWidth += 1
						lastExpandWasRight = True

						#set next column to this rect's number
						for y2 in range(y, y+rectHeight):
							grid[x+rectWidth-1][y2] = rectNum

						#for expanding down, one cell has been added to check
						if canExpandDown:
							canExpandDown = (grid[x+rectWidth-1][y+rectHeight] == -1)

						#check that this rect doesn't touch the edge of the grid
						canExpandRight = (x+rectWidth < gridWidth)

						#if not, check whether the next column can be expanded into
						#TODO: this check could be rendered invalid by a subsequent expansion in the other direction, so move it elsewhere
						if canExpandRight:
							for y2 in range(y, y+rectHeight):
								if grid[x+rectWidth][y2] != -1:
									canExpandRight = False
									break
						
					elif canExpandDown:
						#print('  expand down')
						rectHeight += 1
						lastExpandWasRight = False

						#set next row to this rect's number
						for x2 in range(x, x+rectWidth):
							grid[x2][y+rectWidth-1] = rectNum

						#for expanding down, one cell has been added to check
						if canExpandRight:
							canExpandRight = (grid[x+rectWidth][y+rectHeight-1] == -1)

						#check that this rect doesn't touch the edge of the grid
						canExpandDown = (y+rectHeight < gridHeight)

						#if not, check whether the next column can be expanded into
						#TODO: this check could be rendered invalid by a subsequent expansion in the other direction, so move it elsewhere
						if canExpandDown:
							for x2 in range(x, x+rectWidth):
								if grid[x2][y+rectHeight] != -1:
									canExpandDown = False
									break

					else:
						break
						

				rectNum += 1
	return rectNum

print('\nWalkability:')
#populateGrid()
loadGrid('grid1.txt')
printGrid()

print('\nRects:')
startTime = datetime.datetime.now()
numRects = splitGrid()
endTime = datetime.datetime.now()
delta = endTime - startTime
printGrid()
print('\ncompleted in {} seconds, created {} rects from {} tiles'.format(delta.total_seconds(), numRects, gridWidth*gridHeight))