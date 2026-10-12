# Audi B8.5 source layers

Reference: https://adncustom.fr/en/products/audi-8v1-s1-s3-rs3-rs6-2010-2017
Source builder: https://adncustom.gokickflip.com/customize/startingpoint/6936db7229b92813eca0ad83
Source revision: 6a7263d15364fa19ec1d84a3 (inspected 2026-10-12).

`audiB85Assets.json` maps source names to the original registered 1080px PNG layers from `https://cdnv2.mycustomizer.com/adncustom/<filename>`. Existing descriptive filenames originate from the same builder. No background, watermark, brand advertising, RS3 badge or carbon-additive layer is rendered.

Rendering order: paddles and symbols, sport base, selected top/bottom material, selected side material, airbag, badge, stripe or LED. All layers are decoded before updating the canvas, and superseded renders are discarded. Failed loads are retryable. The Audi LED is the existing B9.5 source photograph, cropped to its visible housing and registered to the B8.5 rim.

The source provides three black grip materials and eight photographed forged finishes; it does not provide colored leather grips. Black airbag covers have seven stitching colors in smooth leather and Alcantara. The B8.5 UI only offers these supported colors. Standard wheel buttons remain part of the base. Racing paddles offer source classic/forged finishes and separate symbol layers; magnetic paddles have fixed white symbols and no color or length selectors.

The source explicitly labels stitching as invisible in its configurator and provides no stitch layers. Stitch color remains selectable and saved in the order, with an explicit explanation at that control; it does not tint grip material or other pixels. Airbag logo color is fixed to the source black rings. Airbag cover selection uses real material/stitch layers. With no replacement cover selected the neutral black center remains visible, as a reference for the customer's reused airbag.

Fitment remains the customer's requested Audi ranges, independent of the source vendor's fitment claims.
