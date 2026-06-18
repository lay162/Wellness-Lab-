import sharp from 'sharp'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { mkdirSync, copyFileSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const assetsDir = 'C:\\Users\\laure\\.cursor\\projects\\c-Users-laure-OneDrive-Documents-Wellness-Lab-Site-PWA\\assets'
const sourceDir = join(root, 'scripts', 'source-assets', 'testimonials')
const outDir = join(root, 'public', 'content', 'success-stories')

mkdirSync(sourceDir, { recursive: true })
mkdirSync(outDir, { recursive: true })

const files = {
  'chantelle-before-source.png': 'c__Users_laure_AppData_Roaming_Cursor_User_workspaceStorage_df5ef2bd98370f24a0d49e2a8f384501_images_6c8dfadc-e7d5-4552-8624-9d6fd31f5ead-e3d5d20e-d95b-4acf-912b-7ca6e2e35a0b.png',
  'chantelle-after-source.png': 'c__Users_laure_AppData_Roaming_Cursor_User_workspaceStorage_df5ef2bd98370f24a0d49e2a8f384501_images_6dc8f096-386d-4c9e-a6ca-ddf1376c196b-df28c0d6-efb1-48cd-a3fe-f9f041d8200f.png',
  'steph-before-source.png': 'c__Users_laure_AppData_Roaming_Cursor_User_workspaceStorage_df5ef2bd98370f24a0d49e2a8f384501_images_a3f2dab1-70aa-40d4-947d-400cd9a439ef-7a8099d1-4f85-4f03-993a-348e9f147cee.png',
  'steph-after-source.png': 'c__Users_laure_AppData_Roaming_Cursor_User_workspaceStorage_df5ef2bd98370f24a0d49e2a8f384501_images_fa12e5c9-b362-4254-9bd8-47feae65e74d-81d11686-aac1-437b-b20c-92d3707fd5a3.png',
}

for (const [dest, src] of Object.entries(files)) {
  copyFileSync(join(assetsDir, src), join(sourceDir, dest))
}

async function processCollage(input, output, crop) {
  const meta = await sharp(input).metadata()
  const { width, height } = meta
  await sharp(input)
    .extract({
      left: Math.round(width * crop.left),
      top: Math.round(height * crop.top),
      width: Math.round(width * (1 - crop.left - crop.right)),
      height: Math.round(height * (1 - crop.top - crop.bottom)),
    })
    .resize(800, null, { withoutEnlargement: true })
    .jpeg({ quality: 88 })
    .toFile(output)
}

async function processPhoto(input, output) {
  await sharp(input)
    .rotate()
    .trim({ threshold: 20 })
    .resize(700, 700, { fit: 'cover', position: 'centre' })
    .modulate({ brightness: 1.03, saturation: 0.95 })
    .sharpen({ sigma: 0.5 })
    .jpeg({ quality: 88 })
    .toFile(output)
}

// Crop Facebook UI chrome from collage screenshots
await processCollage(
  join(sourceDir, 'chantelle-before-source.png'),
  join(outDir, 'chantelle-anita-rowland-before.jpg'),
  { left: 0.02, top: 0.12, right: 0.02, bottom: 0.18 }
)
await processCollage(
  join(sourceDir, 'chantelle-after-source.png'),
  join(outDir, 'chantelle-anita-rowland-after.jpg'),
  { left: 0.02, top: 0.12, right: 0.02, bottom: 0.18 }
)
await processPhoto(join(sourceDir, 'steph-before-source.png'), join(outDir, 'steph-wilcock-before.jpg'))
await processPhoto(join(sourceDir, 'steph-after-source.png'), join(outDir, 'steph-wilcock-after.jpg'))

console.log('Testimonial images processed → public/content/success-stories/')
