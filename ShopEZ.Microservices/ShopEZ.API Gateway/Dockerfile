FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY . .
RUN dotnet restore "ShopEZ.API Gateway/ShopEZ.API Gateway.csproj"
RUN dotnet publish "ShopEZ.API Gateway/ShopEZ.API Gateway.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
COPY ["ShopEZ.API Gateway/ocelot.Docker.json", "ocelot.json"]
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "ShopEZ.API Gateway.dll"]
    