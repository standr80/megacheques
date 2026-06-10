#!/usr/bin/env bash
# Downloads all images currently hotlinked from the old WordPress site
# into site/public/images/_originals/ for local conversion to WebP.
# Run from the project root:  bash download-images.sh
set -uo pipefail

OUT="$(cd "$(dirname "$0")" && pwd)/site/public/images/_originals"
mkdir -p "$OUT"

URLS=(
"https://www.megacheques.co.uk/wp-content/uploads/2022/02/Mega-Big-Cheque-3.jpg"
"https://www.megacheques.co.uk/wp-content/uploads/2022/02/Mega-Big-Cheque-4.jpg"
"https://www.megacheques.co.uk/wp-content/uploads/2022/02/Mega-Big-Cheque.jpg"
"https://www.megacheques.co.uk/wp-content/uploads/2022/02/Mega-Cheques-Header-Image-1.jpg"
"https://www.megacheques.co.uk/wp-content/uploads/2022/02/Mega-Cheques-Header-Image-5.jpg"
"https://www.megacheques.co.uk/wp-content/uploads/2022/03/2m-socially-distanced-cheque_Forbes-Family-Group.jpg"
"https://www.megacheques.co.uk/wp-content/uploads/2022/03/Alan-Bick-sponsors-of-British-Police-Women_s-RFC.jpg"
"https://www.megacheques.co.uk/wp-content/uploads/2022/03/Assurity-Consulting-%C2%A9Charlotte-Paul_ugc.jpg"
"https://www.megacheques.co.uk/wp-content/uploads/2022/03/BOTB-Prize-Giving-jumbo-cheque.jpg"
"https://www.megacheques.co.uk/wp-content/uploads/2022/03/Balloons-Charity-@Fund4Balloons_Munchkins-Day-Nursery.jpg"
"https://www.megacheques.co.uk/wp-content/uploads/2022/03/BigDogLEJOG.jpg"
"https://www.megacheques.co.uk/wp-content/uploads/2022/03/CITC_Man-City_Blindspot-Global-cheque.jpg"
"https://www.megacheques.co.uk/wp-content/uploads/2022/03/CameronHomes_Megacheque.jpg"
"https://www.megacheques.co.uk/wp-content/uploads/2022/03/Daiwa-Capital-Markets.jpg"
"https://www.megacheques.co.uk/wp-content/uploads/2022/03/Durham-Parish-Council_NorthernEcho.jpg"
"https://www.megacheques.co.uk/wp-content/uploads/2022/03/House-of-Darwin-Mega-Cheque.jpg"
"https://www.megacheques.co.uk/wp-content/uploads/2022/03/House-of-Darwin-quiz-jackpot-presentation.jpg"
"https://www.megacheques.co.uk/wp-content/uploads/2022/03/Imagine-If-Trust_FB_150821.jpg"
"https://www.megacheques.co.uk/wp-content/uploads/2022/03/LER-Estates-mini-cheque1.jpg"
"https://www.megacheques.co.uk/wp-content/uploads/2022/03/LER-Estates-mini-cheque2.jpg"
"https://www.megacheques.co.uk/wp-content/uploads/2022/03/MC_CameronHomes-Warwickshire-flooding-project.jpeg"
"https://www.megacheques.co.uk/wp-content/uploads/2022/03/MC_City-of-Durham-Parish-Council_Durham-Hospital-Radio.jpeg"
"https://www.megacheques.co.uk/wp-content/uploads/2022/03/MC_Furston-Knapper-Solicitors_fundraising-for-The-Special-Olympics-Plymouth-_-District.jpg"
"https://www.megacheques.co.uk/wp-content/uploads/2022/03/Megacheques_ThisMorning-1.jpg"
"https://www.megacheques.co.uk/wp-content/uploads/2022/03/Megacheques_ThisMorning.jpg"
"https://www.megacheques.co.uk/wp-content/uploads/2022/03/Par-Market.jpg"
"https://www.megacheques.co.uk/wp-content/uploads/2022/03/Paul-Bakery_Twitter.jpg"
"https://www.megacheques.co.uk/wp-content/uploads/2022/03/Tim-Bacon-Foundation_Twitter-image.jpg"
"https://www.megacheques.co.uk/wp-content/uploads/2022/03/Vowley-Racing-winners-prizes_Vowley-Open-Hunt-Race.jpg"
"https://www.megacheques.co.uk/wp-content/uploads/2022/03/Vowley-Racing-winners-prizes_Vowley-Open-Hunt-Race2.jpg"
"https://www.megacheques.co.uk/wp-content/uploads/2022/03/Vowley-Racing-winners-prizes_Vowley-Open-Hunt-Race3.jpg"
"https://www.megacheques.co.uk/wp-content/uploads/2022/03/Vowley-Racing-winners-prizes_Vowley-Open-Hunt-Race4.jpg"
"https://www.megacheques.co.uk/wp-content/uploads/2023/11/Mega-Cheque-Sizes.png"
"https://www.megacheques.co.uk/wp-content/uploads/2023/11/Mega-Cheque-Uses-1.png"
"https://www.megacheques.co.uk/wp-content/uploads/2023/11/Oversized-Cheques.png"
"https://www.megacheques.co.uk/wp-content/uploads/2023/11/Reuseable-Mega-Cheque-removebg-preview.png"
"https://www.megacheques.co.uk/wp-content/uploads/2023/11/Single-Use-Cheque.png"
"https://www.megacheques.co.uk/wp-content/uploads/2023/11/download-1.jpeg"
"https://www.megacheques.co.uk/wp-content/uploads/2023/11/download-2.jpeg"
"https://www.megacheques.co.uk/wp-content/uploads/2023/11/download.jpeg"
"https://www.megacheques.co.uk/wp-content/uploads/2023/11/smallcheque.png"
"https://www.megacheques.co.uk/wp-content/uploads/2022/02/Mega-Cheques-Logo-1.png"
)

ok=0; fail=0
for url in "${URLS[@]}"; do
  name="$(basename "${url%%\?*}")"
  if curl -fsSL --retry 2 -o "$OUT/$name" "$url"; then
    echo "OK   $name"
    ok=$((ok+1))
  else
    echo "FAIL $url"
    fail=$((fail+1))
  fi
done

echo
echo "Downloaded: $ok   Failed: $fail"
echo "Saved to: $OUT"
