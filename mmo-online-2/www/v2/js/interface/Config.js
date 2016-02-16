var UIConfig = {
	backgroundColor:0x151515,
	borderColor:0x555555,
	highlightColor:0x3fbfbf,
	negativeColor:0xbf3f3f,
	positiveColor:0x3fbf3f,

	fontColor:0xffffff,
	fontHighlightColor:0xffff33,

	fontName: "Roboto Condensed",
	fontSize: 14,

	headerTextY:6,
	headerTextX:4,

	windowBorderWidth:2,

	elementListPadding:2,
	elementListOuterPadding:4,

	textBoxPadding:3,

	headerHeight:24
};

//this way I can use values defined above
MmooUtil.applyProps(UIConfig, {	
	headerText: 	MmooUtil.createFontDef({size:16}),
	bodyText: 		MmooUtil.createFontDef({size:14}),
	formText: 		MmooUtil.createFontDef({size:16}),
	titleText: 		MmooUtil.createFontDef({size:20, bold:true}),
	titleTextHover: MmooUtil.createFontDef({size:20, bold:true, color:UIConfig.fontHighlightColor}),
	bannerText: 	MmooUtil.createFontDef({size:44, bold:true}),


	elementListPadding:2,
	elementListOuterPadding:4,

	textBoxPadding:3
});