import os
import sys

extensions = ['js']
ignoreFolders = ['node_modules', 'lib', 'jquery-ui']
ignoreFiles = [] #might need? if I do, it indicates poor organization

files = {}
total = 0

startDirs = [d for d in sys.argv[1:]]

if (len(startDirs) == 0):
	startDirs.append('.')

#doesn't support extensions with multiple dots, but those are dumb anyway
def hasProperExtension(fileName):
	split = fileName.split('.')
	if (split[len(split)-1] in extensions):
		return True
	return False

for startDir in startDirs:
	dirTotal = 0
	print('\nCounting source lines in:\n{}'.format(os.path.abspath(startDir)))
	for root, dirs, files in os.walk(startDir):
		dirs[:] = [d for d in dirs if d not in ignoreFolders]
		files[:] = [f for f in files if hasProperExtension(f) and f not in ignoreFiles]

		for f in files:
			path = os.path.join(root,f)
			fp = open(path, 'r')
			count = len(fp.readlines())
			fp.close()
			dirTotal += count

			print('  {0:<6} {1}'.format(count, path))

	total += dirTotal
	print('  ------\n  ' + str(dirTotal))

print('\nTOTAL: {} lines'.format(total))