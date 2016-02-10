var TextureGenerator = {};

//can be used to overwrite an existing texture, possibly for button animations
TextureGenerator.rectangle = function(width, height, color, borderWidth, borderColor, texture) {
	if (texture) {
		if (typeof texture.renderer === 'number')
			console.log("EEP!");
	}

	var tex = (typeof texture !== "undefined") ? texture : new PIXI.RenderTexture(game.renderer, width, height);
	var g = getVolatileGraphics();
	var offset = borderWidth/2;

	g.lineStyle(borderWidth, borderColor, 1);
	g.beginFill(color, 1);
	g.drawRect(offset, offset, width-borderWidth, height-borderWidth);
	g.endFill();

	tex.render(g);
	return tex;
};

TextureGenerator.text = function(text, font) {
	var pixiText = new PIXI.Text(text, font);
	var renderTex = new PIXI.RenderTexture(game.renderer, pixiText.width, pixiText.height);
	renderTex.render(pixiText);

	return renderTex;
};