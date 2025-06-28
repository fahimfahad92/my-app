export async function GET(request: any) {
  const { searchParams } = new URL(request.url);
  const cityName = searchParams.get("cityName");
  const type = searchParams.get("type");

  if (!cityName)
    return Response.json({ error: "Missing city name" }, { status: 400 });

  console.log("calling for " + cityName + " type " + type);

  var url: string;
  if (type === "OVERVIEW") {
    url =
      `${process.env.WEATHER_API_BASE_URL}` +
      `${process.env.WEATHER_API_GET_CURRENT_DATA_PATH}` +
      `${process.env.WEATHER_API_API_KEY}` +
      `&q=${encodeURIComponent(cityName)}`;
  } else {
    const queryDate = searchParams.get("queryDate");
    url =
      `${process.env.WEATHER_API_BASE_URL}` +
      `${process.env.WEATHER_API_GET_DETAIL_PATH}` +
      `${process.env.WEATHER_API_API_KEY}` +
      `&q=${encodeURIComponent(cityName)}` +
      "&dt=" +
      queryDate;
  }

  const res = await fetch(url);
  const data = await res.json();

  return Response.json(data);
}
