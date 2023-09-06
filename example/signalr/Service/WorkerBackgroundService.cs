using System;
using System.Threading;
using System.Threading.Tasks;
using Example.Hubs;
using Example.Hubs.Clients;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

public class Worker : BackgroundService
{
    private readonly ILogger<Worker> _logger;
    private readonly IHubContext<ChatHub, IChatClient> _chatHub;

    public Worker(ILogger<Worker> logger, IHubContext<ChatHub, IChatClient> chatHub)
    {
        _logger = logger;
        _chatHub = chatHub;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            await _chatHub.Clients.All.Hello(DateTime.Now.ToString());
            await Task.Delay(1000, stoppingToken);
        }
    }
}