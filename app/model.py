import torch
import torch.nn as nn


class LSTMModel(nn.Module):
    def __init__(self, input_size, hidden_size=64, num_layers=2):
        super(LSTMModel, self).__init__()
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True)
        self.fc = nn.Linear(hidden_size, 1)
    def forward(self, x):
        h0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(x.device)
        c0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(x.device)

        out, _ = self.lstm(x, (h0, c0))

        out = out[:, -1, :]
        out = self.fc(out)
        return out.squeeze()


class TSMixerBlock(nn.Module):
    def __init__(self, token_dim, channel_dim, seq_length):
        super(TSMixerBlock, self).__init__()
        self.token_mixing = nn.Sequential(
            nn.LayerNorm(channel_dim),
            nn.Linear(seq_length, token_dim),
            nn.GELU(),
            nn.Linear(token_dim, seq_length)
        )
        self.channel_mixing = nn.Sequential(
            nn.LayerNorm(channel_dim),
            nn.Linear(channel_dim, channel_dim),
            nn.GELU(),
            nn.Linear(channel_dim, channel_dim)
        )

    def forward(self, x):
        # x shape: (batch_size, seq_length, channel_dim)
        residual = x
        x = self.token_mixing(x.transpose(1, 2)).transpose(1, 2)
        x = x + residual

        residual = x
        x = self.channel_mixing(x)
        x = x + residual
        return x


class TSMixer(nn.Module):
    def __init__(self, num_features, mixer_blocks=2, token_dim=256, channel_dim=256, seq_length=24):
        super(TSMixer, self).__init__()
        self.initial_projection = nn.Linear(num_features, channel_dim)
        self.mixer_blocks = nn.Sequential(
            *[TSMixerBlock(token_dim, channel_dim, seq_length) for _ in range(mixer_blocks)]
        )
        self.output_layer = nn.Linear(channel_dim, 1)

    def forward(self, x):
        # x shape: (batch_size, seq_length, num_features)
        x = self.initial_projection(x)  # (batch_size, seq_length, channel_dim)
        x = self.mixer_blocks(x)
        x = x.mean(dim=1)
        x = self.output_layer(x)
        return x.squeeze()
