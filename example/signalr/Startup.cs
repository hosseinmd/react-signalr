using Example.Contract;
using Example.Hubs;
using Example.Service;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Newtonsoft.Json.Converters;
using Septa.AspNetCore.SignalRTypes;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Example
{
    public class Startup
    {
        private const string DefaultCorsPolicyName = "Default";
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddSignalR();
            services.AddCors(options =>
            {
                options.AddPolicy(DefaultCorsPolicyName, builder =>
                {
                    builder
                        .WithOrigins(
                            Configuration["App:CorsOrigins"]
                                .Split(",", StringSplitOptions.RemoveEmptyEntries)
                                .Select(o => o.TrimEnd('/'))
                                .ToArray()
                        )
                        .AllowAnyHeader()
                        .AllowAnyMethod();
                });
            });
            services.AddScoped<IChatHubService, ChatHubService>();
            services.AddControllers().AddNewtonsoftJson(options =>
            options.SerializerSettings.Converters.Add(new StringEnumConverter()));

        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseSignalrType(x =>
            {
                x.RoutePath = "/api/signalRTypes/getSignalrType.json";
                x.HubServices = new Dictionary<string, Type>
                {
                    {
                        nameof(ChatHubService), typeof(ChatHubService)
                    }
                };
            });

            app.UseRouting();
            app.UseCors(DefaultCorsPolicyName);
            app.UseAuthorization();
            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
                endpoints.MapHub<ChatHub>("/hub").RequireCors(builder =>
                {
                    builder
                        .WithOrigins(Configuration.GetSection("App:SignalROrigins").Value)
                        .AllowAnyHeader()
                        .AllowCredentials()
                        .WithMethods("GET", "POST");
                });
            });
        }
    }
}
