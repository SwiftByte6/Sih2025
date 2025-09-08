import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

const projectRoot = path.resolve(process.cwd())
const publicDir = path.join(projectRoot, 'public')
const sourceSvg = path.join(publicDir, 'next.svg')

async function ensureDir(dir) {
  await fs.promises.mkdir(dir, { recursive: true })
}

async function generateIcon(size, dest) {
  const buffer = await fs.promises.readFile(sourceSvg)
  await sharp(buffer, { density: 512 })
    .resize(size, size, { fit: 'contain', background: { r: 15, g: 23, b: 42, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toFile(dest)
}

async function main() {
  await ensureDir(publicDir)
  const targets = [
    { size: 192, name: 'icon-192.png' },
    { size: 512, name: 'icon-512.png' },
    { size: 512, name: 'icon-512-maskable.png' },
  ]

  for (const t of targets) {
    const dest = path.join(publicDir, t.name)
    await generateIcon(t.size, dest)
    // eslint-disable-next-line no-console
    console.log('Generated', dest)
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err)
  process.exit(1)
})


